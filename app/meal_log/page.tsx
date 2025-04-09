"use client"
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Heart, Menu ,BarChart2,LogOut} from "lucide-react"
import Link from 'next/link'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import axios from 'axios'
import {useRouter} from 'next/navigation'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Meal {
  id: number
  meal_name: string
  total_calories: number
  ingredients: string
  proteins: number
  carbs: number
  fats: number
  servings: number
  date: string
}
interface MealLogGroup {
  date: string
  meals: Meal[]
}
export default function MealLog() {
  const [userID, setUserID] = useState<number | null>(null)
  const [mealLogs, setMealLogs] = useState<{ date: string; meals: Meal[] }[]>([])
  const [totalCalories, setTotalCalories] = useState<number>(0)
  const [totalProteins, setTotalProteins] = useState<number>(0)
  const [totalFats, setTotalFats] = useState<number>(0)
  const [totalCarbs, setTotalCarbs] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [userInitial,setUserInitial] = useState('')
  const [loading,setLoading] = useState(true)
  const calendarRef = useRef<HTMLDivElement>(null);
  const router = useRouter()
  const handleLogout = async  () => {

    try {
      await axios.post('api/log-out', {}, {
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
        const res = await axios.post('api/check-auth', {}, { withCredentials: true })
        if (res.data.login !== "Yes") {
          router.push('/')
        } else {
          setUserID(res.data.id)
          setUserInitial(res.data.name[0])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error during authentication check:', error)
        router.push('/')
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (userID) {
      const fetchMeals = async () => {
        try {
          const res = await axios.post('https://express-vercel-nutritrack.vercel.app/get-meals', { user_id: userID }, { withCredentials: true })
          setMealLogs(res.data.data)

          const latestDate = res.data.data
            .map((group: MealLogGroup) => group.date)
            .sort((a:string, b:string) => new Date(b).getTime() - new Date(a).getTime())[0]

          setSelectedDate(latestDate)
        } catch (error) {
          console.error('Error fetching logged meals:', error)
        }
      }
      fetchMeals()
    }
  }, [userID])

  useEffect(() => {
    if (mealLogs.length > 0 && selectedDate) {
      calculateTotalNutrients(mealLogs)
    }
  }, [mealLogs, selectedDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false); // Close the calendar
      }
    };

    // Add event listener when the calendar is open
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);
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
  const calculateTotalNutrients = (groupedMeals: { date: string; meals: Meal[] }[]) => {
    const mealsForSelectedDate = groupedMeals
      .filter(group => group.date === selectedDate)
      .flatMap(group => group.meals)

    const totals = mealsForSelectedDate.reduce(
      (acc, meal) => {
        acc.calories += meal.total_calories
        acc.proteins += meal.proteins
        acc.fats += meal.fats
        acc.carbs += meal.carbs
        return acc
      },
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    )

    setTotalCalories(totals.calories)
    setTotalProteins(totals.proteins)
    setTotalFats(totals.fats)
    setTotalCarbs(totals.carbs)
  }

  const deleteMeal = async (mealIndex: number, dateIndex: number) => {
    try {
      const mealToDelete = mealLogs[dateIndex].meals[mealIndex]
      await axios.post(
        'https://express-vercel-nutritrack.vercel.app/delete-logged-meal',
        { id: mealToDelete.id },
        { withCredentials: true }
      )
      const updatedLogs = mealLogs.map((group, index) => {
        if (index === dateIndex) {
          return {
            ...group,
            meals: group.meals.filter((_, idx) => idx !== mealIndex)
          }
        }
        return group
      }).filter((group) => group.meals.length > 0)
      setMealLogs(updatedLogs)
      calculateTotalNutrients(updatedLogs)
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  }

  const filteredMeals = mealLogs
    .filter((group) => group.date === selectedDate)
    .flatMap((group) => group.meals)

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]
    setSelectedDate(formattedDate)
    setIsCalendarOpen(false)
  }

  const handleCalendarToggle = () => {
    setIsCalendarOpen(!isCalendarOpen)
  }

  const mealsDates = mealLogs.map((group) => group.date)

  const isDateDisabled = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]
    return !mealsDates.includes(formattedDate)
  }
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
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 to-teal-100 dark:from-green-800 dark:to-teal-800">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/90 backdrop-blur-lg dark:bg-green-900 sticky top-0 z-50 shadow-md">
        <Link className="flex items-center justify-center" href="#">
          <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">NutriTrack</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/saved_meals">
            Saved Recipes
          </Link>
          <UserMenu/>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white dark:bg-green-800">
            <nav className="flex flex-col gap-4">
              <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/saved_meals">
                Saved Recipes
              </Link>
              <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/settings">
                Settings
              </Link>
            </nav>
            <div className="flex flex-col space-y-2 mt-4">
            <Button variant="ghost" onClick={handleLogout} className="justify-start text-red-500 hover:text-red-600 hover:bg-red-100">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <h1 className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-green-500">
          Your Meal Log
        </h1>

        <div className="mb-8 flex justify-center items-center gap-6">
          <Button onClick={handleCalendarToggle} className="flex items-center gap-2 bg-teal-500 text-white rounded-md py-2 px-4 hover:bg-teal-600">
            <CalendarIcon className="w-5 h-5" />
            {selectedDate}
          </Button>
        </div>

        {isCalendarOpen && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-white shadow-xl rounded-lg" ref={calendarRef} >
            <DayPicker
              selected={new Date(selectedDate)}
              onDayClick={handleDateSelect}
              disabled={isDateDisabled}
            />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 bg-white text-gray-800 rounded-xl shadow-md">
            <div className="text-xl font-semibold">Calories</div>
            <div className="text-lg">{totalCalories} kcal</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-teal-500 text-white rounded-xl shadow-md">
            <div className="text-xl font-semibold">Proteins</div>
            <div className="text-lg">{totalProteins} g</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-red-500 text-white rounded-xl shadow-md">
            <div className="text-xl font-semibold">Fats</div>
            <div className="text-lg">{totalFats} g</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-yellow-500 text-white rounded-xl shadow-md">
            <div className="text-xl font-semibold">Carbs</div>
            <div className="text-lg">{totalCarbs} g</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {filteredMeals.map((meal, mealIndex) => (
            <Card key={mealIndex} className="flex flex-col overflow-hidden bg-white dark:bg-green-800 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105">
              <CardHeader className="bg-gradient-to-r from-[#A3E5D7] to-[#56C8A7]">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{meal.meal_name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Total Nutrition:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Calories: {meal.total_calories}</div>
                    <div>Fats: {meal.fats}g</div>
                    <div>Proteins: {meal.proteins}g</div>
                    <div>Carbs: {meal.carbs}g</div>
                  </div>
                </div>
                <div className="mt-4 text-gray-800 dark:text-gray-100">
                  <strong>Ingredients: </strong>{meal.ingredients}
                </div>
                <div className="mt-4 text-gray-800 dark:text-gray-100">
                  <strong>Servings: </strong>{meal.servings}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-green-900 p-4">
                <Button variant="ghost" className="w-full text-red-500" onClick={() => deleteMeal(mealIndex, 0)}>
                  Delete Meal
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 NutriTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
