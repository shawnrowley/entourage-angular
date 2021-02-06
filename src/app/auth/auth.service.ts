import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth.model';
import { Subject } from "rxjs";
import { Router } from '@angular/router';
import { environment } from "../../environments/environment";

const AUTH_URL = environment.API_ENDPOINT + "/users/";

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();  //Just tells if authenticated

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuthenicated() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createuser(email: string, password: string) {
    const auth: Auth = {
      email: email,
      password: password
    }

    return this.http.post<{message: string, auth: Auth}>(AUTH_URL + "/register", auth)
      .subscribe(response => {
        console.log(response);
        this.router.navigate(["/"]);
      }, error => {
        this.authStatusListener.next(false);
        console.log(error);
      });

  }

  login(email: string, password: string) {
    const auth: Auth = {
      email: email,
      password: password
    }

    this.http.post<{token: string, expires: number, userId: string}>(AUTH_URL + "/login", auth)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expires = response.expires;
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.setAuthenticationTimer(expires);
        this.authStatusListener.next(true);
        const now = new Date();
        const expiration = new Date(now.getTime() + (expires * 1000));
        console.log(expiration);
        this.saveAuthenticaton(token, expiration, this.userId);
        this.router.navigate(["/"]);
      }
    }, error => {
      this.authStatusListener.next(false);
      console.log(error);
    });
  }

  isAuthenticatedUser() {
    const authentication = this.getAuthentication();
    if (authentication) {
      const now = new Date();
      const expires = (authentication.expiration.getTime() - now.getTime());
       if (expires > 0) {
        this.token = authentication.token;
        this.isAuthenticated = true;
        this.userId = authentication.userId;
        this.setAuthenticationTimer(expires/1000);
        this.authStatusListener.next(true);
      }
    }
  }

  setAuthenticationTimer(duration: number) {
    console.log("Setting time: ")
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, (duration * 1000)); // millisecond conversion
  }

  logout() {
    this.token =null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthenticaton();
    this.router.navigate(["/"]);
  }

  private saveAuthenticaton(token: string, expiration: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expiration.toISOString());
    localStorage.setItem("userId", userId)
  }

  private clearAuthenticaton() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthentication() {
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if (!token || !expiration) {
      return;
    }
    return {
      token: token,
      expiration: new Date(expiration),
      userId: userId
    }
  }


}
