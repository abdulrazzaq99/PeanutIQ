from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.knowledge import Article
from app.schemas.knowledge import ArticleCreate, ArticleUpdate, ArticleResponse
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/articles", response_model=List[ArticleResponse])
def get_articles(
    is_published: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Article)
    
    # If a farmer is requesting, ONLY return published articles
    if current_user.role == 'farmer':
        query = query.filter(Article.is_published == True)
    elif is_published is not None:
        # Admins/researchers can filter by published status (e.g. to see pending articles)
        query = query.filter(Article.is_published == is_published)
        
    return query.all()


@router.post("/articles", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    article_in: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only researchers and admins can create articles
    if current_user.role not in ['researcher', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized to create articles")
    
    # New articles are pending by default (is_published=False)
    db_article = Article(
        title=article_in.title,
        category=article_in.category,
        excerpt=article_in.excerpt,
        content=article_in.content,
        author=article_in.author,
        is_published=False
    )
    
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


@router.put("/articles/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: UUID,
    article_in: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only admins can edit or approve articles (or researchers who own it, but for simplicity let's allow both for now)
    if current_user.role not in ['admin', 'researcher']:
        raise HTTPException(status_code=403, detail="Not authorized to edit articles")
        
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    if article_in.title is not None:
        db_article.title = article_in.title
    if article_in.category is not None:
        db_article.category = article_in.category
    if article_in.excerpt is not None:
        db_article.excerpt = article_in.excerpt
    if article_in.content is not None:
        db_article.content = article_in.content
    if article_in.is_published is not None:
        db_article.is_published = article_in.is_published
        
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


@router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ['admin', 'researcher']:
        raise HTTPException(status_code=403, detail="Not authorized to delete articles")
        
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    db.delete(db_article)
    db.commit()
    return None
