'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { ArrowRight, Utensils, BarChart2, Apple, Dumbbell, Heart, Lock, Menu, User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"
import axios from 'axios'
import { useRouter } from 'next/navigation'

import SuccessDialog from '@/components/SuccessDialog'
import ContactForm from '@/components/ui/ContactForm'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const [review, setReview] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [description,setDescription] = useState("");
  const [loading,setLoading] = useState(true)
  const [isSuccessDialogOpen,setIsSuccessDialogOpen] = useState(false)
  const handleLogin = () => {
    // Simulating login process
    setIsLoggedIn(true)
    setUserInitial('J') // This would normally come from the user's name after login
  }

  const handleLogout = async  () => {

    try {
       await axios.post('https://express-vercel-nutritrack.vercel.app/log-out', {}, {
        withCredentials: true
      })
      router.push('/')

    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.post('https://express-vercel-nutritrack.vercel.app/check-auth', {}, {
          withCredentials: true
        })
        
        if (res.data.login == "Yes") {
          setIsLoggedIn(true)
          setUserName(res.data.name)
          setUserInitial(res.data.name[0])
          
        } else {
          
        }

        setLoading(false)
      } catch (error) {
        console.error('Error during authentication check:', error)
        setIsLoggedIn(false)
      }
    }

    checkAuth()
  }, [])

  const UserMenu = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" className="rounded-full">
          <Avatar>
            <AvatarFallback className="bg-green-500 text-white text-2xl">{userInitial.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col space-y-2">
          <Button variant="ghost" className="justify-start" onClick={()=>router.push('/settings')}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="justify-start text-red-500 hover:text-red-600 hover:bg-red-100">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }  
  const AuthButton = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="flex flex-col space-y-2">
          <Button onClick={handleLogin}>Login</Button>
          <Button variant="outline">Sign Up</Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          
        </DialogTrigger>
        <DialogContent className="max-w-md p-6 rounded-lg">
          <Input
            placeholder="Describe yourself in 1-2 words"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 40))}
            className="w-full p-2 border rounded-md mb-2"
          />
          <Textarea
            placeholder="Leave your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <Button className="mt-2 w-full" onClick={() => {setIsOpen(false); setIsSuccessDialogOpen(true)}}>Submit Review</Button>
        </DialogContent>
      </Dialog>
      <SuccessDialog 
        open={isSuccessDialogOpen} 
        onClose={() => setIsSuccessDialogOpen(false)} 
        message="Thank you for leaving a review!" 
      />
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 backdrop-blur-md dark:bg-gray-800/80 sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-2xl font-bold text-gray-700 dark:text-gray-200">NutriTrack</span>
        </Link>
        {!isLoggedIn && (
        <nav className="ml-auto items-center gap-4 sm:gap-6 hidden md:flex">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-200" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-200" href="#testimonials">
            Testimonials
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-200" href="#contact">
            Contact Us
          </Link>
          {isLoggedIn ? <UserMenu /> : <AuthButton />}
        </nav>
        )}
        {isLoggedIn && (
        <nav className="ml-auto items-center gap-4 sm:gap-6 hidden md:flex">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-200" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-200" href="/meal_log">
            Meals Log
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-200" href="/saved_meals">
            Saved Meals
          </Link>
          {isLoggedIn ? <UserMenu /> : <AuthButton />}
        </nav>
        )}
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4">
              {!isLoggedIn && (
              <div>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
                  Feature
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#testimonials">
                  Testimonials
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
                  Pricing
                </Link>
              </div>)}
              {isLoggedIn && (
              <div>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
                  Dashboard
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#testimonials">
                  Your Meal Log
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
                  Saved Meals
                </Link>
              </div>)}
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" className="justify-start">
                    <Utensils className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="justify-start text-red-500 hover:text-red-600 hover:bg-red-100">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button onClick={handleLogin}>Login/Sign Up</Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1">
        {!isLoggedIn && (<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
                  Track Your Nutrition Journey with NutriTrack
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Achieve your health goals with our comprehensive nutrition tracking and meal planning app.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-300" onClick={()=>router.push('/')}>Get Started</Button>
                <Button variant="outline" className="group" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>)}
        {isLoggedIn && (<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
                  Welcome Back, {userName}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Achieve your health goals with our comprehensive nutrition tracking and meal planning app.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-300" onClick={()=> setIsOpen(true)}>Share Feedback</Button>
                <Button variant="outline" className="group" onClick={()=>{
                  router.push('/dashboard')
                }}>
                  Your DashBoard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>)}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">Key Features</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Utensils className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <CardTitle>Food Logging</CardTitle>
                </CardHeader>
                <CardContent>
                  Easily log your meals and snacks with our extensive food database.
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <BarChart2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <CardTitle>Nutrition Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  Get detailed breakdowns of your macro and micronutrient intake with visual charts and graphs.
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Apple className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <CardTitle>Meal Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  Plan your meals in advance with our meal plan generating AI based on your nutritional goals.
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Dumbbell className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <CardTitle>Exercise Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  Log your weight and see how it tracks with your current nutritional intake.
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Lock className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <CardTitle>Goal Setting</CardTitle>
                </CardHeader>
                <CardContent>
                  Set personalized goals for weights and nutrients. Track your progress over time.
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Heart className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <CardTitle>Save Favorite Meals</CardTitle>
                </CardHeader>
                <CardContent>
                  Save Meals from our extensive database , create your own recipes or use AI to create recipes and lo 
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">What Our Users Say</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Sarah M.</CardTitle>
                  <CardDescription>Lost 20 lbs in 3 months</CardDescription>
                </CardHeader>
                <CardContent>
                &quot;NutriTrack made it so easy to stay on top of my nutrition. The insights and meal planning features were game-changers for me!&quot;
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>John D.</CardTitle>
                  <CardDescription>Fitness enthusiast</CardDescription>
                </CardHeader>
                <CardContent>
                &quot;As someone who&apos;s serious about fitness, NutriTrack helps me dial in my macros and reach my performance goals. Highly recommended!&quot;
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Emily L.</CardTitle>
                  <CardDescription>Busy mom of three</CardDescription>
                </CardHeader>
                <CardContent>
                &quot;NutriTrack&apos;s meal planning feature has been a lifesaver for my family. It&apos;s helped us eat healthier and save time on grocery shopping.&quot;
                </CardContent>
              </Card>
              <Card>
  <CardHeader>
    <CardTitle>Michael R.</CardTitle>
    <CardDescription>Gained 10 lbs of muscle</CardDescription>
  </CardHeader>
  <CardContent>
  &quot;NutriTrack took the guesswork out of my nutrition plan. Tracking my protein intake and meal timing was never easier!&quot;
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Jessica T.</CardTitle>
    <CardDescription>Health-conscious foodie</CardDescription>
  </CardHeader>
  <CardContent>
  &quot;I love how NutriTrack helps me make better food choices while still enjoying my favorite meals. The recipe suggestions are fantastic!&quot;
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>David S.</CardTitle>
    <CardDescription>Long-distance runner</CardDescription>
  </CardHeader>
  <CardContent>
  &quot;Fueling for endurance is crucial, and NutriTrack has helped me optimize my carb-loading and recovery nutrition. It&apos;s a game-changer!&quot;
  </CardContent>
</Card>
            </div>
          </div>
        </section>
        
        <ContactForm/>
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 NutriTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}