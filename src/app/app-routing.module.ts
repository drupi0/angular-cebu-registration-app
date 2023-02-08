import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';

const routes: Routes = [{
  path: "",
  component: LoginPageComponent
},
{
  path: "v2",
  loadChildren: () => import("./v2/v2-app.module").then(m => m.V2AppModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
