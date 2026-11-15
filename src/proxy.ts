import { NextRequest, NextResponse } from "next/server";

const DEVICE_COOKIE = "helixedu_device";

export function proxy(request: NextRequest) {
  let token = request.cookies.get(DEVICE_COOKIE)?.value;
  const shouldSetCookie = !token || !/^[0-9a-f-]{36}$/i.test(token);

  if (shouldSetCookie) {
    token = crypto.randomUUID();
    request.cookies.set(DEVICE_COOKIE, token);
  }

  const response = NextResponse.next({ request });
  if (shouldSetCookie) {
    response.cookies.set(DEVICE_COOKIE, token!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
