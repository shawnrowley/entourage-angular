import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable() //makes it injectable for service, creting authservice in constructor
export class AuthInterceptor implements HttpInterceptor { // Middleware like node except for outgoing request
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    console.log(authToken);
    const authRequest = req.clone({
      headers: req.headers.set("Authorization", "Bearer " + authToken)
    }); //creat a copy for safety
    return next.handle(authRequest);

  }
}
