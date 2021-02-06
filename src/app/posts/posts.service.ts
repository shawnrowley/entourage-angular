import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map  } from 'rxjs/operators';

import { Post } from './post.model';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment";

const POST_URL = environment.API_ENDPOINT + "/posts/";

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postPerPage: number, page: number) {
    const queryParams = `?pagesize=${postPerPage}&page=${page}`;  //Must be backticks for queryParams
    this.http
      .get<{message: string, posts: any, count: number}>(POST_URL + queryParams)  //Change posts to type of *any* to support the transformation of data
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map(post => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                owner: post.owner
               };
            }),
            count: postData.count
          };
        })
      )
      .subscribe((transformedPostsData) => {
        console.log(transformedPostsData);
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostsData.count
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    // return {...this.posts.find(post => post.id === id)} //Static return
    return this.http.get<{message: string, post: any}>(POST_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http.post<{message: string, post: Post}>(POST_URL, postData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      })
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
       postData =   {
        id: id,
        title : title,
        content: content,
        imagePath: image,
        owner: null
     };
    }

    this.http.put<{message: string}>(POST_URL + id, postData)
      .subscribe((response) => {
        this.router.navigate(["/"]);
      });
  }

  deletePost(id: string) {
    return this.http.delete(POST_URL + id);
  }

}
