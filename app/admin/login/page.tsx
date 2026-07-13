"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        username: values.username.trim(),
        password: values.password.trim(),
        redirect: false,
        callbackUrl,
      });

      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(res?.error || "Invalid username or password.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
      relative
      flex
      min-h-screen
      items-start
      justify-center
      px-4
      pt-6
      overflow-hidden
    "
    >
      {/* Background */}

      <div className="fixed inset-0 z-0">
        <Image
          src="/images/Backround.png"
          alt="Background"
          fill
          priority
          unoptimized
          quality={90}
          className="object-cover"
        />

        <div
          className="
          absolute
          inset-0
          bg-black/50
        "
        />
      </div>

      {/* Login Box */}

      <div
        className="
        relative
        z-20
        w-full
        max-w-sm
      "
      >
        <div
          className="
          rounded-2xl
          border
          border-white/30
          bg-white/95
          p-6
          shadow-2xl
          backdrop-blur-sm
        "
        >
          {/* Header */}

          <div
            className="
            mb-4
            text-center
          "
          >
            <div
              className="
              mx-auto
              mb-3
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-slate-900
              text-white
              shadow-lg
            "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3l7 4v5c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V7l7-4Z" />

                <path d="M9.5 12.5 11 14l3.5-4" />
              </svg>
            </div>

            <p
              className="
              mb-1
              text-xs
              font-bold
              uppercase
              tracking-[0.25em]
              text-blue-600
            "
            >
              Administrator Portal
            </p>

            <h1
              className="
              text-2xl
              font-bold
              text-black
            "
            >
              Admin Login
            </h1>

            <p
              className="
              mt-1
              text-sm
              text-gray-600
            "
            >
              Sign in securely to manage dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Username */}

            <div>
              <label
                className="
                mb-1.5
                block
                text-sm
                font-semibold
                text-black
              "
              >
                Username
              </label>

              <input
                {...register("username")}
                placeholder="Enter username"
                autoComplete="username"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-2.5
                  text-black
                  placeholder:text-gray-400
                  outline-none
                  transition
                  focus:border-blue-600
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />

              {errors.username && (
                <p
                  className="
                  mt-1
                  text-xs
                  text-red-600
                "
                >
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}

            <div>
              <label
                className="
                mb-1.5
                block
                text-sm
                font-semibold
                text-black
              "
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2.5
                    pr-12
                    text-black
                    placeholder:text-gray-400
                    outline-none
                    transition
                    focus:border-blue-600
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                    hover:text-black
                  "
                >
                  👁
                </button>
              </div>

              {errors.password && (
                <p
                  className="
                  mt-1
                  text-xs
                  text-red-600
                "
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div
                className="
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-3
                py-2
                text-sm
                text-red-700
              "
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-4
                w-full
                rounded-lg
                bg-slate-900
                py-2.5
                font-semibold
                text-white
                shadow-lg
                transition
                hover:bg-slate-800
                disabled:bg-gray-400
              "
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p
            className="
            mt-4
            text-center
            text-xs
            text-gray-400
          "
          >
            © 2026 Smart Dynamic Department Display System
          </p>
        </div>
      </div>
    </div>
  );
}
