import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/sign-up',
    '/sign-in',
    '/',
    '/home'

])

const isPublicApiRoute = createRouteMatcher([
    '/api/videos'
])

export default clerkMiddleware((auth , req) => {
  const {userId} =auth()
  const currentUrl  = new URL(req.url)  // getting the current url 
  const isAccessingHome = currentUrl.pathname ==="/home"  // checking when user access the home url 
  const isApiRequest = currentUrl.pathname.startsWith("/api")  // checking when user is accessing the url 
  
  // user is not accessing the home route then it should be redirect to home route this is when user is login 
  if (userId && isPublicRoute(req)&& !isAccessingHome){
      return NextResponse.redirect(new URL("/home", req.url))
  }
  
  // when user is not signed in 
  if(!userId){

    // if user is not signed in and trying to access the protected the route 
    if(!isPublicApiRoute(req) && !isPublicRoute(req)){  // logical AND work when both are true that why we use ! operator
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }
    
    // if the request is for a protected API and then user is not logged in
    if(isApiRequest && !isPublicApiRoute(req)){
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};