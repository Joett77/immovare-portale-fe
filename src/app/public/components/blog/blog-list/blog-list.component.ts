import { Component, inject, Input, OnInit } from '@angular/core';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { Post } from '../../../models';
import { BlogService } from '../blog.service';
import { BannerCtaComponent } from '../../../../shared/organisms/banner-cta/banner-cta.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/organisms/pagination/pagination.component';
import { SearchBarComponent } from '../../../../shared/molecules/search-bar/search-bar.component';
import { BlogTagFilterComponent } from '../blog-tag-filter/blog-tag-filter.component';
import { NewsletterComponent } from '../../../../shared/molecules/newsletter/newsletter.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    BlogCardComponent,
    BannerCtaComponent,
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    PaginationComponent,
    SearchBarComponent,
    BlogTagFilterComponent,
    NewsletterComponent,
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
})
export class BlogListComponent implements OnInit {
  blogPostsService: any = inject(BlogService);
  posts: Post[] = [];
  tagsList: string[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  limit: number = 4;
  searchQuery: string = '';
  selectedTag: string = '';
  private router = inject(Router);

  ngOnInit(): void {
    this.loadPosts();
    setTimeout(() => {
      this.buildTagsList();
    }, 1000);
  }

  filteringByTag(tag: string) {
    // If the same tag is clicked again, deselect it
    if (this.selectedTag === tag) {
      this.selectedTag = '';
    } else {
      this.selectedTag = tag;
    }

    this.currentPage = 1;
    this.loadPosts();
  }

  searchResult(searchQuery: string) {
    this.searchQuery = searchQuery;
    this.currentPage = 1;
    this.loadPosts();
  }

  loadPosts() {
    this.blogPostsService
      .getPosts(this.currentPage, this.limit, this.searchQuery, this.selectedTag)
      .subscribe((res: any) => {
        console.log(res);
        this.posts = res.data;
        this.totalPages = res.meta.pagination.pageCount;
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    const targetDiv = document.getElementById('blog');
    if (targetDiv) {
      targetDiv.scrollIntoView({ behavior: 'smooth' });
    }
    this.loadPosts();
  }

  buildTagsList(): void {
    this.tagsList = this.posts
      .map(post => post.tags)
      .flat()
      .filter((tag, index, self) => self.indexOf(tag) === index);
  }

  goToVoglioVendere() {
    this.router.navigate(['/voglio-vendere']);
  }
}
