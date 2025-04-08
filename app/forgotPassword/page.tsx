"use client"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MountainIcon, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    try {
      // Here you would typically send a request to your backend to initiate the password reset process
      // For this example, we'll just simulate a successful submission
    const response = await axios.post('https://express-vercel-nutritrack.vercel.app/forgotPassword', {
      email
    })
    if(response.data.success){
        setIsSubmitted(true)
    }
    else{
        setError("This email does not exist. Please register or enter a valid email")
    }


    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800 shadow-md">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-lg font-bold text-gray-700 dark:text-gray-200">NutriTrack</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600 dark:text-green-400">Forgot Password</CardTitle>
            <CardDescription className="text-center">Enter your email to reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Reset Password
                </Button>
              </form>
            ) :
             ( 
              <Alert className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                We&apos;ve sent password reset instructions to your email address.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-green-600 hover:underline dark:text-green-400 flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          
          </CardFooter>
        </Card>
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 NutriTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}