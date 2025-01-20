import { auth } from "auth";
import { APP_ROUTES, Route } from "utils/constants";

export default auth((req) => {
  const { auth, nextUrl } = req;

  if (!req.auth && req.nextUrl.pathname !== "/api/auth/signin") {
    const newUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (auth) {
    const userRole = auth.user.role;

    const restrictedRoles = APP_ROUTES.find(
      (route: Route) => route.path === nextUrl.pathname
    )?.restrict;

    if (restrictedRoles && !restrictedRoles.includes(userRole)) {
      const unauthorizedUrl = new URL("/unauthorized", nextUrl.origin);
      return Response.redirect(unauthorizedUrl);
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
