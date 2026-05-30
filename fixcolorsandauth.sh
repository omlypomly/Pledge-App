  #!/bin/bash
cd /workspaces/Pledge-App

# ── 1. Nuke all remaining violet/purple across every source file ──────────────
find app components lib -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i \
  -e 's/violet-900/\[#303D31\]/g' \
  -e 's/violet-800/\[#3d4e3e\]/g' \
  -e 's/violet-700/\[#785964\]/g' \
  -e 's/violet-600/\[#91C687\]/g' \
  -e 's/violet-500/\[#91C687\]/g' \
  -e 's/violet-400/\[#91C687\]/g' \
  -e 's/violet-300/\[#D9F6FF\]/g' \
  -e 's/violet-200/\[#D9F6FF\]/g' \
  -e 's/violet-100/\[#D9F6FF\]/g' \
  -e 's/purple-900/\[#303D31\]/g' \
  -e 's/purple-800/\[#3d4e3e\]/g' \
  -e 's/purple-700/\[#785964\]/g' \
  -e 's/purple-600/\[#785964\]/g' \
  -e 's/purple-500/\[#785964\]/g' \
  -e 's/purple-400/\[#785964\]/g' \
  -e 's/purple-300/\[#AFC2D5\]/g' \
  -e 's/purple-200/\[#AFC2D5\]/g' \
  -e 's/purple-100/\[#AFC2D5\]/g' \
  -e 's/#7c3aed/#91C687/g' \
  -e 's/#a78bfa/#D9F6FF/g' \
  -e 's/#ec4899/#785964/g' \
  -e 's/from-violet-\[[^]]*\]/from-[#91C687]/g' \
  -e 's/to-violet-\[[^]]*\]/to-[#785964]/g' \
  -e 's/StakeUp/Pledge./g'

echo "Color replacements done"

# ── 2. Fix middleware — make create/challenges pages publicly accessible ───────
cat > middleware.ts << 'EOF'
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms",
  "/privacy",
  "/leaderboard",
  "/challenges(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
EOF

echo "Middleware updated"

# ── 3. Fix landing page CTA buttons to go directly to /challenges/create ──────
sed -i 's|href="/sign-up"|href="/challenges/create"|g' app/page.tsx

echo "CTA links updated"

git add -A
git commit -m "fix: remove all purples, rebrand colors, make challenges page public"
git push origin main
echo "Done! Pushed to main."
