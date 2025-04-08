'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bookmark, Heart, Menu, Trash2,BarChart2,LogOut } from "lucide-react"
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {useRouter} from 'next/navigation'
import axios from 'axios'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback} from "@/components/ui/avatar"
interface Recipe {
  id: number
  saved_recipe_id: number
  name: string
  calories: number
  proteins: number
  carbs: number
  fats: number
  ingredients: string[]
}

export default function SavedRecipes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [userID, setUserID] = useState(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const router = useRouter()
  const [userInitial, setUserInitial] = useState('')
  const [loading,setLoading] = useState(true)


  



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
        if (res.data.login !== "Yes") {
          router.push('/');
        } else {
          setUserID(res.data.id)
          setUserInitial(res.data.name[0])
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (userID) {
      
      const fetchCalories = async () => {
        try {
          const res = await axios.post(
            'https://express-vercel-nutritrack.vercel.app/get-calories-saved-recipes',
            { id: userID },
            { withCredentials: true }
          );
          setSavedRecipes(res.data.srecipes);
          setLoading(false)
        } catch (error) {
          console.error('Error during fetching saved recipes:', error);
          router.push('/');
        }
      };
      fetchCalories();
    }
  }, [userID]);

  const filteredRecipes = savedRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteRecipe = async (recipeId: number) => {
    try {
      const res = await axios.post(
        'https://express-vercel-nutritrack.vercel.app/delete-saved-meal',
        { id : recipeId },
        { withCredentials: true }
      )
      if (res.data.success) {
        // Remove deleted recipe from state to update UI
        setSavedRecipes(savedRecipes.filter(recipe => recipe.saved_recipe_id !== recipeId));
      } else {
        console.error('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error during recipe deletion:', error);
    }
  };
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
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/90 backdrop-blur-lg dark:bg-gray-800/90 sticky top-0 z-50 shadow-md">
        <Link className="flex items-center justify-center" href="#">
          <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">NutriTrack</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/meal_log">
            Meal Log
          </Link>
          <UserMenu/>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white dark:bg-gray-800">
            <nav className="flex flex-col gap-4">
              <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="#">
                Dashboard
              </Link>
              <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="#">
                Meal Log
              </Link>
              <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="#">
                Saved Recipes
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col justify-between">
        <h1 className="text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
          Your Saved Recipes
        </h1>

        {/* Search Bar */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search your recipes..."
            className="pl-12 pr-4 py-3 w-full rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map(recipe => (
            <Card key={recipe.id} className="flex flex-col min-h-[350px] overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105">
              <CardHeader className="bg-gradient-to-r from-[#A7F3D0] to-[#D1F7E5]">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{recipe.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Nutrition (per serving):</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Calories: {recipe.calories}</div>
                    <div>Fats: {recipe.fats}g</div>
                    <div>Proteins: {recipe.proteins}g</div>
                    <div>Carbs: {recipe.carbs}g</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Ingredients:</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recipe.ingredients
                      .filter(ingredient => ingredient.trim() !== '') // Remove empty or whitespace-only ingredients
                      .map((ingredient, index, arr) => (
                        index === arr.length - 1 ? ingredient.trim() : `${ingredient.trim()}, `
                      ))}
                  </p>
              </div>
              </CardContent>
              <CardFooter className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all"
                  onClick={() => deleteRecipe(recipe.saved_recipe_id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Recipe</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <Bookmark className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">No recipes found. Try a different search term or add new recipes to your collection!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 NutriTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
