/* ============================================
   Login Page
   Authentication page for all user types
   ============================================ */

"use client";

import type React from "react";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 LẤY redirect từ URL
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || null;

  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    // 🔥 Gửi redirectUrl xuống hook useLogin
    loginMutation.mutate({
      email,
      password,
      redirectUrl: redirect || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-secondary/20 flex items-center justify-center p-4 relative">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Về trang chủ</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">
              F
            </span>
          </div>

          <div className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold block">Đăng nhập</CardTitle>
            <CardDescription className="text-base">
              Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@fpt.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-11 border-2 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-11 border-2 focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg text-base font-semibold shadow-md hover:shadow-lg transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                Hoặc
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mb-4">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-secondary/20 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
