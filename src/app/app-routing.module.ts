import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router"
import { AuthGuard } from "./auth/auth.guard";
import { PostCreateComponent } from "./posts/post-create/post-create.component";
import { PostListComponent } from "./posts/post-list/post-list.component";
import { MediaDisplayComponent } from './media/media.component'

const routes: Routes = [
  { path: "", component: PostListComponent},          //i.e. localhost:4200
  { path: "swipe", component: MediaDisplayComponent},          //i.e. localhost:4200
  { path: "create", component: PostCreateComponent, canActivate: [AuthGuard]},  //i.e. localhost:4200/create
  { path: "edit/:id", component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: "auth", loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],  //imports the above definition to AppRoutingModule
  exports: [RouterModule],    //makes it exportable to be used in other modules i.e. app.component.ts
  providers: [AuthGuard]     //porviding guard for routes
})

export class AppRoutingModule {}
