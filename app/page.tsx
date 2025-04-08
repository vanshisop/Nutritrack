"use client"
import { useState} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent,} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Head from "next/head";
import { MountainIcon, Menu } from 'lucide-react'
import Link from 'next/link'

import axios from 'axios'
import { useRouter } from 'next/navigation';

export default function LoginRegister() {
 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  

  // Register form state
  
  const [invalidPassword,setInvalidPassword] = useState("")
  const [invalidUser,setInvalidUser] = useState("")
  
  const router = useRouter();
  

  

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await axios.post('api/login', {
      loginEmail,loginPassword
    },{
      withCredentials: true
    })
    if(response.data.login == "allow"){
      router.push('/home')
    }
    else if(response.data.login == "Incorrect password"){
      setInvalidPassword("Your Password is Incorrect. Please try again")
      setInvalidUser("")
      return
    }
    else{
      setInvalidUser("This email does not exist. Please enter a valid email or register a new account.")
      setInvalidPassword("")
      return
    }

    
  }
  
  

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800 shadow-md">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-lg font-bold text-gray-700 dark:text-gray-200">NutriTrack</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="/home#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="/home#testimonials">
            Testimonials
          </Link>
          <Link className="text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="/home#contact">
            Contact
          </Link>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>
      
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-800 p-4">
          <Link className="block py-2 text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="#">
            Features
          </Link>
          <Link className="block py-2 text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="#">
            Pricing
          </Link>
          <Link className="block py-2 text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="#">
            About
          </Link>
          <Link className="block py-2 text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400" href="#">
            Contact
          </Link>
        </nav>
      )}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600 dark:text-green-400">Welcome to NutriTrack</CardTitle>
            <CardDescription className="text-center">Login or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
          <Tabs value="login" className="w-full">
 

          <TabsContent value="login">
  <form onSubmit={handleLogin} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input 
        id="email" 
        placeholder="Enter your email" 
        type="email" 
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        required 
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input 
        id="password" 
        placeholder="Enter your password" 
        type="password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        required 
      />
    </div>

    {invalidPassword && <p className="text-red-500 text-sm">{invalidPassword}</p>}
    {invalidUser && <p className="text-red-500 text-sm">{invalidUser}</p>}

    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
      Login
    </Button>
  </form>

  <div className="mt-4 text-center">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Don’t have an account?{" "}
      <Link href="/register" className="text-green-600 hover:underline dark:text-green-400">
        Register
      </Link>
    </p>
    <p className="mt-2 text-sm text-green-600 hover:underline dark:text-green-400">
      <Link href="/forgotPassword">Forgot password?</Link>
    </p>
  </div>
</TabsContent>

</Tabs>

          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By using NutriTrack, you agree to our{" "}
              <Link href="#" className="text-green-600 hover:underline dark:text-green-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-green-600 hover:underline dark:text-green-400">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 NutriTrack Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

