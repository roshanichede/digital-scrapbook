"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2, Mail, Lock, UserPlus, LogIn } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Signup form schema
const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const router = useRouter();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onLogin(values: LoginFormValues) {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Welcome back! 💕",
          description: "Successfully logged in to your memory book",
        });
        
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSignup(values: SignupFormValues) {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Account created! 🎉",
          description: "Please check your email to verify your account",
        });
        
        // Switch to login tab
        setActiveTab("login");
        signupForm.reset();
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong during signup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Floating hearts animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-rose-300 dark:text-rose-700 opacity-40"
            style={{
              left: `${15 + (i * 12)}%`,
              animation: `floatUp ${10 + (i % 3) * 3}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`
            }}
          >
            <Heart className="w-4 h-4" fill="currentColor" />
          </div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-200 opacity-20 blur-3xl dark:bg-pink-900"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-900"></div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes floatUp {
          0% { 
            transform: translateY(100vh) rotate(0deg) scale(0.8); 
            opacity: 0;
          }
          15% { 
            opacity: 0.6;
          }
          85% { 
            opacity: 0.4;
          }
          100% { 
            transform: translateY(-20vh) rotate(360deg) scale(1.2); 
            opacity: 0;
          }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full w-fit">
              <Heart className="h-8 w-8 text-rose-500" fill="currentColor" />
            </div>
            <CardTitle className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
              Our Memory Book
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Sign in to access your shared memories
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}