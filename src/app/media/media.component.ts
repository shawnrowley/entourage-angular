import { Component, ViewChild, ViewEncapsulation, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Post } from '../posts/post.model'
import { PostsService } from '../posts/posts.service';
import { AuthService } from 'src/app/auth/auth.service';

import { SwiperOptions } from 'swiper';
import {
  SwiperConfigInterface,
  SwiperCoverflowEffectInterface,
  SwiperDirective,
  SwiperComponent,
  SwiperNavigationInterface,
  SwiperPaginationInterface,
  SwiperScrollbarInterface
} from 'ngx-swiper-wrapper';


@Component({
  selector: 'app-media-display',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class MediaDisplayComponent implements OnInit, OnDestroy {

public slides = [
  "First slide",
  "Second slide",
  "Third slide",
  "Fourth slide",
  "Fifth slide",
  "Sixth slide"
];

public type: string = "component";

public disabled: boolean = false;

public coverflowEffectConfig: SwiperCoverflowEffectInterface = {
  rotate: 0,
  stretch: 200,
  depth: 200,
  modifier: 1,
  slideShadows: false
};

public navigationConfig: SwiperNavigationInterface = {
  nextEl: ".swiper-button-next",
  prevEl: ".swiper-button-prev",
  hideOnClick: true
  // disabledClass?: string;
  // hiddenClass?: string;
};

public config: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 1,
    keyboard: true,
    mousewheel: true,
    scrollbar: false,
    navigation: true,
    pagination: false
  };

public configCoverFlow: SwiperConfigInterface = {
  //effect: "coverflow",
  effect: "cube",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  // coverflowEffect: {
  //   rotate: 50,
  //   stretch: 0,
  //   depth: 100,
  //   modifier: 1,
  //   slideShadows: true
  // },
  // cubeEffect: {
  //   shadow: true,
  //   slideShadows: true,
  //   shadowOffset: 20,
  //   shadowScale: 0.94,
  // },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
    hideOnClick: true
  },
  pagination: {
    el: ".swiper-pagination"
  }
};

private scrollbar: SwiperScrollbarInterface = {
  el: ".swiper-scrollbar",
  hide: false,
  draggable: true
};

private pagination: SwiperPaginationInterface = {
  el: ".swiper-pagination",
  clickable: true,
  hideOnClick: false
};

@ViewChild(SwiperComponent) componentRef: SwiperComponent;
@ViewChild(SwiperDirective) directiveRef: SwiperDirective;

  posts: Post[] = [];
  isLoading = false;
  totalPosts = 10;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authListenerSubs: Subscription;

  constructor(public postsService: PostsService, public authService: AuthService) {}
  ngOnInit() {
    // this.config = {
    //   direction: 'horizontal',
    //   grabCursor: true,
    //   centeredSlides: true,
    //   loop: true,
    //   slidesPerView: 'auto',
    //   autoplay: true,
    //   speed: 1000,
    //   coverflowEffect: coverflowEffectConfig,
    //   navigation: navigationConfig
    // };

    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService.getPostUpdateListener()
        .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
      this.userIsAuthenticated = this.authService.getIsAuthenicated();
      this.authListenerSubs = this.authService.getAuthStatusListener()
        .subscribe(isAuthenticated =>{
           this.userIsAuthenticated = isAuthenticated;
           this.userId = this.authService.getUserId();
        })
  }

  onChangePage(pageData: PageEvent) {
      this.isLoading = true;
      this.currentPage = pageData.pageIndex + 1;
      this.postsPerPage = pageData.pageSize;
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(id: string) {
    this.postsService.deletePost(id).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage)
    }, (error) => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  public onIndexChange(index: number): void {
    console.log('Swiper index: ', index);
  }

  public onSwiperEvent(event: string): void {
    console.log('Swiper event: ', event);
  }
}


