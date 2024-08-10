import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home"
])
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])
export default clerkMiddleware((auth,req)=>{
    const {userId} = auth();
    const currentUrl = new URL(req.url);
    const isAccessingDashboard = currentUrl.pathname === "/home";
    const isApiRequest = currentUrl.pathname.startsWith("/api");

    //Is the user is already login then user must be redirected to the home. User is not allowed to visit the signin and signup if already login
    if(userId && isPublicApiRoute(req) && !isAccessingDashboard){
        return NextResponse.redirect(new URL("/home",req.url));
    }

    //If user is not logged in
    if(!userId){
        //If user is note logged in and try to access the protected route then redirect user to signup page
        if(!isPublicRoute(req) && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/sign-in",req.url));
        }

        //if the user is not logged in and try to accessing the protected api route
        if(isApiRequest && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/sign-in",req.url));
        }
    }

    return NextResponse.next()
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
