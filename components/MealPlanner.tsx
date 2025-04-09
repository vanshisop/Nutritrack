"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Sparkles, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash } from 'react-feather';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress"
import axios from "axios"
import MealComponent from "./MealComponent"
import MealComponentWithSearch from "./MealComponentWithSearch"
import {useRouter} from "next/navigation"

type Meal = {
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  type: "quick" | "custom" | "saved"
  ingredients: string[]
}

type DailyPlan = {
  date: string;
  meals: Meal[];
};

type WeeklyPlan = DailyPlan[]

interface Recipe {
  id: number
  saved_recipe_id: string
  name: string
  calories: string
  proteins: string
  carbs: string
  fats: string
  ingredients: string[]
}

const emptyMeal: Meal = { 
  name: "", 
  calories: 0, 
  protein: 0, 
  carbs: 0, 
  fats: 0, 
  type: "quick", 
  ingredients: [] 
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function EnhancedMealPlannerDashboard({userID}:{userID:number}) {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => 
    Array(7).fill({ date: "", meals: [] })
  )

  const [currentWeeklyPlan, setCurrentWeeklyPlan] = useState<WeeklyPlan>(() => 
    Array(7).fill({ date: "", meals: [] })
  );

  const [caloriesValid, setCaloriesValid] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [proteinValid, setProteinValid] = useState(true);
  const [carbsValid, setCarbsValid] = useState(true);
  const [fatsValid, setFatsValid] = useState(true);
  const router = useRouter()
  
  const validateInput = (value:number, min:number, max:number, setter:(value:boolean)=>void) => {
    const numericValue = value;
    if (numericValue >= min && numericValue <= max) {
      setter(true);
    } else {
      setter(false);
    }
  };
  
  const [cuisine, setCuisine] = useState('any');
  const [preferredFoodPercentage, setPreferredFoodPercentage] = useState('20');
  const [preferredFoodsInput, setPreferredFoodsInput] = useState('');
  const [mealPlanPresent,setMealPlanPresent] = useState(false)
  const [excludedFoodsInput, setExcludedFoodsInput] = useState('');
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [excludedFoods, setExcludedFoods] = useState<string[]>([]);
  
  const isFormValid =
    caloriesValid && proteinValid && carbsValid && fatsValid;
  
  const [currentDay, setCurrentDay] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [currentMealIndex, setCurrentMealIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [showAiPromptDialog, setShowAiPromptDialog] = useState(false)
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('view')
  const [generationOption, setGenerationOption] = useState<string>("specific")
  const [calories, setCalories] = useState<number>();
  const [protein, setProtein] = useState<number>();
  const [carbs, setCarbs] = useState<number>();
  const [fats, setFats] = useState<number>();

  useEffect(() => {
    const getMealPlan = async () => {
      try {
        const res = await axios.post('https://express-vercel-nutritrack.vercel.app/get-meal-plan', {
          userID: userID
        }, {
          withCredentials: true
        })
        setCurrentWeeklyPlan(res.data.meal)
        setWeeklyPlan(res.data.meal)
        const allDaysEmpty = (res.data.meal as DailyPlan[]).every((day: DailyPlan) => day.meals.length === 0);
        setMealPlanPresent(!allDaysEmpty);
        setCalories(res.data.prefs.calories)
        setProtein(res.data.prefs.protein)
        setCarbs(res.data.prefs.carbs)
        setFats(res.data.prefs.fats)
      } catch (error) {
        console.error('Error during authentication check:', error);
        router.push('/');
      }
    };
    
    const fetchCalories = async () => {
      try {
        const res = await axios.post(
          'https://express-vercel-nutritrack.vercel.app/get-calories-saved-recipes',
          { id: userID },
          { withCredentials: true }
        );
        setSavedRecipes(res.data.srecipes); 
      } catch (error) {
        console.error('Error during authentication check:', error);
        router.push('/');
      }
    };
    
    fetchCalories();
    getMealPlan();
  }, []);

  const handleDeleteMeal = async (mealIndex:number) => {
    const updatedMeals = [...weeklyPlan[currentDay].meals];
    updatedMeals.splice(mealIndex, 1)[0];
    setWeeklyPlan({
      ...weeklyPlan,
      [currentDay]: {
        ...weeklyPlan[currentDay],
        meals: updatedMeals,
      },
    });
  };

  const handleGenerateMeal = async () => {
    setIsGenerating(true)
    let newWeeklyPlan = [...weeklyPlan]

    if (generationOption === "specific") {
      const response = await axios.post(
        'https://express-vercel-nutritrack.vercel.app/get-chatgpt-meal-plan-specific',{
          description: aiPrompt,
          calories: calories,
          protein: protein,
          fats: fats,
          carbs: carbs
        },{
          withCredentials: true
        }
      )
      newWeeklyPlan[currentDay].meals.push(response.data.mealPlan)
    } else if (generationOption === "day") {
      const response = await axios.post(
        'https://express-vercel-nutritrack.vercel.app/get-chatgpt-meal-plan-weekly',{
          calories: calories,
          fats: fats,
          protein: protein,
          carbs: carbs,
          preferredFoods: preferredFoods,
          preferredFoodPercentage: preferredFoodPercentage,
          excludedFoods: excludedFoods,
          cuisine: cuisine,
          type : "daily",
          day: currentDay
        },{
          withCredentials: true
        }
      )
      newWeeklyPlan[currentDay] = response.data.meal
    } else {
      const response = await axios.post(
        'https://express-vercel-nutritrack.vercel.app/get-chatgpt-meal-plan-weekly',{
          calories: calories,
          fats: fats,
          protein: protein,
          carbs: carbs,
          preferredFoods: preferredFoods,
          preferredFoodPercentage: preferredFoodPercentage,
          excludedFoods: excludedFoods,
          cuisine: cuisine,
          type: "weekly"
        },{
          withCredentials: true
        }
      )
      newWeeklyPlan = response.data.meal
    }

    setWeeklyPlan(newWeeklyPlan)
    setIsGenerating(false)
    setShowAiPromptDialog(false)
  }
  
  const addMeal = () => {
    const newMeal: Meal = {
      type: 'custom',
      name: 'N/A',
      calories: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
      ingredients: [],
    };
  
    setWeeklyPlan((prevState) => {
      const newWeeklyPlan = prevState ? [...prevState] : [];
      newWeeklyPlan[currentDay] = {
        ...newWeeklyPlan[currentDay],
        meals: [...newWeeklyPlan[currentDay]?.meals || [], newMeal],
      };
      return newWeeklyPlan;
    });
  };

  const handleMealChange = (mealIndex: number, updatedMeal: Partial<Meal>) => {
    setWeeklyPlan((prev) => {
      const newWeeklyPlan = prev ? [...prev] : [];
      const currentDayPlan = newWeeklyPlan[currentDay];

      if (currentDayPlan) {
        const updatedMeals = currentDayPlan.meals.map((meal, index) => 
          index === mealIndex ? { ...meal, ...updatedMeal } : meal
        );
        newWeeklyPlan[currentDay] = {
          ...currentDayPlan,
          meals: updatedMeals,
        };
      }
      return newWeeklyPlan;
    });
  };

  const handleSubmitPlan = () => {
    setShowSummaryDialog(true)
  }

  const confirmMealPlan = async () => {
    setCurrentWeeklyPlan(weeklyPlan)
    setShowSummaryDialog(false)
    await axios.post(
      'https://express-vercel-nutritrack.vercel.app/set-meal-plan',{
        userID :userID,
        weeklyPlan: weeklyPlan, 
      },{
        withCredentials: true
      }
    )
  }

  const totalCalories = (plan: { date: string, meals: Array<{ name: string, calories: number }> }) => {
    if (!Array.isArray(plan.meals)) return 0;
    return plan.meals.reduce((sum, meal) => sum + Number(meal.calories), 0);
  };

  const totalProtein = (plan: { date: string, meals: Array<{ name: string, protein: number }> }) => {
    if (!Array.isArray(plan.meals)) return 0;
    return plan.meals.reduce((sum, meal) => sum + Number(meal.protein), 0);
  };
  
  const totalCarbs = (plan: { date: string, meals: Array<{ name: string, carbs: number }> }) => {
    if (!Array.isArray(plan.meals)) return 0;
    return plan.meals.reduce((sum, meal) => sum + Number(meal.carbs), 0);
  };
  
  const totalFats = (plan: { date: string, meals: Array<{ name: string, fats: number }> }) => {
    if (!Array.isArray(plan.meals)) return 0;
    return plan.meals.reduce((sum, meal) => sum + Number(meal.fats), 0);
  };

  const renderMealCard = (mealType: string, meal: Meal) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg capitalize flex items-center">
          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {mealType}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{meal.name || "Not set"}</h4>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <Badge variant="secondary" className="text-xs sm:text-sm">{meal.calories} calories</Badge>
          <Badge variant="outline" className="text-xs sm:text-sm">{meal.type}</Badge>
        </div>
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mt-1 sm:mt-2">
            <p className="text-xs sm:text-sm font-medium mb-1">Ingredients:</p>
            <ul className="list-disc list-inside text-xs sm:text-sm space-y-1">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-muted-foreground">{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderMealPlanSummary = () => {
    return (
      <ScrollArea className="h-[500px] sm:h-[600px] w-full pr-2 sm:pr-4">
        {daysOfWeek.map((day, index) => (
          <div key={day} className="mb-4 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">{day}</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {weeklyPlan[index]?.meals.map((meal, mealIndex) => (
                <div key={mealIndex}>
                  {renderMealCard(meal.type, meal)}
                </div>
              ))}
            </div>
            <Card className="bg-muted">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-center">
                  <p className="text-base sm:text-lg font-semibold">Total Calories:</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalCalories(weeklyPlan[index] || [])}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-base sm:text-lg font-semibold">Protein</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalProtein(weeklyPlan[index] || [])}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-base sm:text-lg font-semibold">Carbs</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalCarbs(weeklyPlan[index] || [])}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-base sm:text-lg font-semibold">Fats</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalFats(weeklyPlan[index] || [])}
                  </p>
                </div>
                <Progress
                  value={(totalCalories(weeklyPlan[index] || []) / 2500) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        ))}
      </ScrollArea>
    );
  };

  return (
    <div className="px-2 sm:px-4">
      <Card className="w-full mx-auto shadow-xl z-10">
        <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold">Weekly Meal Planner</CardTitle>
          <CardDescription className="text-sm sm:text-xl mt-1 sm:mt-2 text-green-100">
            Plan your meals, track your calories, and eat healthier
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <Button
                variant={activeTab === 'view' ? 'default' : 'outline'}
                onClick={() => setActiveTab('view')}
                className="w-24 sm:w-32 text-xs sm:text-sm"
              >
                View Plan
              </Button>
              <Button
                variant={activeTab === 'edit' ? 'default' : 'outline'}
                onClick={() => setActiveTab('edit')}
                className="w-24 sm:w-32 text-xs sm:text-sm"
              >
                Edit Plan
              </Button>
            </div>
          </div>

          {activeTab === 'view' && (
            mealPlanPresent ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDay((prev) => (prev - 1 + 7) % 7)}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Previous Day
                  </Button>
                  <h3 className="text-xl sm:text-2xl font-bold">{daysOfWeek[currentDay]}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDay((prev) => (prev + 1) % 7)}
                    className="w-full sm:w-auto"
                  >
                    Next Day
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {currentWeeklyPlan[currentDay]?.meals.map((meal, index) => (
                    <div key={index}>
                      {renderMealCard(meal.type, meal)}
                    </div>
                  ))}
                </div>

                <Card className="mt-4 sm:mt-6 bg-muted">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg sm:text-xl font-semibold">Total Calories:</p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {totalCalories(currentWeeklyPlan[currentDay] || [])}
                      </p>
                    </div>
                    <Progress
                      value={(totalCalories(currentWeeklyPlan[currentDay] || []) / 2500) * 100}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="bg-primary/10 border border-primary text-primary rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center min-h-48 sm:min-h-72 flex flex-col justify-center">
                <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">You do not have a meal plan set.</h2>
                <p className="text-sm sm:text-base">Let's get you started with a personalized meal plan for the week!</p>
              </div>
            )
          )}

          {activeTab === 'edit' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
                <Dialog open={showAiPromptDialog} onOpenChange={setShowAiPromptDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                      disabled={!isFormValid}
                    >
                      <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {isGenerating ? "This may take a while..." : "Generate Meal"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl sm:text-2xl">Generate AI Meal</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 sm:gap-6 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="generation-option" className="text-base sm:text-lg">
                          Generation Option
                        </Label>
                        <RadioGroup
                          id="generation-option"
                          value={generationOption}
                          onValueChange={(value) => setGenerationOption(value)}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="specific" id="specific" />
                            <Label htmlFor="specific" className="text-sm sm:text-base">
                              Specific Meal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="day" id="day" />
                            <Label htmlFor="day" className="text-sm sm:text-base">
                              Full Day
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="week" id="week" />
                            <Label htmlFor="week" className="text-sm sm:text-base">
                              Entire Week
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {generationOption === "specific" && (
                        <div className="grid gap-2">
                          <Label htmlFor="specific-meal" className="text-base sm:text-lg">
                            Meal Description
                          </Label>
                          <textarea
                            id="specific-meal"
                            className="border rounded-lg p-2 w-full min-h-[100px]"
                            placeholder="What kind of meal do you want? Please specify macro or calorie requirements if any."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                          />
                        </div>
                      )}

                      {generationOption !== "specific" && (
                        <div>
                          <div className="grid gap-2">
                            <Label htmlFor="cuisine" className="text-base sm:text-lg">
                              Cuisine
                            </Label>
                            <Select
                              value={cuisine}
                              onValueChange={(value) => setCuisine(value)}
                            >
                              <SelectTrigger id="cuisine" className="w-full">
                                <SelectValue placeholder="Select Cuisine" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                <SelectItem value="italian">Italian</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                                <SelectItem value="indian">Indian</SelectItem>
                                <SelectItem value="mexican">Mexican</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2 mt-4">
                            <Label htmlFor="preferred-foods" className="text-base sm:text-lg">
                              Preferred Foods
                            </Label>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center space-x-2">
                                <Textarea
                                  id="preferred-foods"
                                  placeholder="Enter foods you prefer"
                                  value={preferredFoodsInput}
                                  onChange={(e) => setPreferredFoodsInput(e.target.value)}
                                  className="min-h-[100px] flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (preferredFoodsInput.trim()) {
                                      setPreferredFoods([...preferredFoods, preferredFoodsInput]);
                                      setPreferredFoodsInput('');
                                    }
                                  }}
                                  className="ml-2"
                                >
                                  Add Food
                                </Button>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {preferredFoods.map((food, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center bg-gray-200 text-gray-800 p-1 rounded text-xs sm:text-sm"
                                  >
                                    <span>{food}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPreferredFoods = [...preferredFoods];
                                        newPreferredFoods.splice(index, 1);
                                        setPreferredFoods(newPreferredFoods);
                                      }}
                                      className="ml-2 text-red-500"
                                    >
                                      X
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4">
                                <p className="text-sm sm:text-base">One of these preferred foods should be included in my meal approximately</p>
                                <div className="flex items-center space-x-2 mt-1 sm:mt-2">
                                  <Select
                                    value={preferredFoodPercentage}
                                    onValueChange={(value) => setPreferredFoodPercentage(value)}
                                  >
                                    <SelectTrigger id="preferred-food-percentage" className="w-[100px]">
                                      <SelectValue placeholder="Select %"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['20', '30', '40', '50', '60', '70', '80', '90', '100'].map((percentage) => (
                                        <SelectItem key={percentage} value={percentage}>
                                          {percentage}%
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span className="text-sm sm:text-base">of the time.</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-2 mt-4">
                            <Label htmlFor="excluded-foods" className="text-base sm:text-lg">
                              Excluded Foods
                            </Label>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center space-x-2">
                                <Textarea
                                  id="excluded-foods"
                                  placeholder="Enter foods you can't have"
                                  value={excludedFoodsInput}
                                  onChange={(e) => setExcludedFoodsInput(e.target.value)}
                                  className="min-h-[100px] flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (excludedFoodsInput.trim()) {
                                      setExcludedFoods([...excludedFoods, excludedFoodsInput]);
                                      setExcludedFoodsInput('');
                                    }
                                  }}
                                  className="ml-2"
                                >
                                  Add Food
                                </Button>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {excludedFoods.map((food, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center bg-gray-200 text-gray-800 p-1 rounded text-xs sm:text-sm"
                                  >
                                    <span>{food}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newExcludedFoods = [...excludedFoods];
                                        newExcludedFoods.splice(index, 1);
                                        setExcludedFoods(newExcludedFoods);
                                      }}
                                      className="ml-2 text-red-500"
                                    >
                                      X
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-4">
                            <Switch
                              id="advanced-options"
                              checked={showAdvancedOptions}
                              onCheckedChange={setShowAdvancedOptions}
                            />
                            <Label htmlFor="advanced-options" className="text-base sm:text-lg">
                              Advanced Options
                            </Label>
                          </div>
                        </div>
                      )}

                      {showAdvancedOptions && (
                        <div className="grid gap-4">
                          {[
                            { 
                              label: "Calories", 
                              state: calories, 
                              setState: setCalories, 
                              min: 800, 
                              max: 3500, 
                              setter: setCaloriesValid, 
                              readOnly: true, 
                              bgColor: "bg-green-100", 
                              cursor: "cursor-not-allowed" 
                            },
                            { 
                              label: "Protein (g)", 
                              state: protein, 
                              setState: setProtein, 
                              min: 20, 
                              max: 350, 
                              setter: setProteinValid, 
                              calorieInfo: "1 gram protein = 4 cals" 
                            },
                            { 
                              label: "Carbs (g)", 
                              state: carbs, 
                              setState: setCarbs, 
                              min: 70, 
                              max: 550, 
                              setter: setCarbsValid, 
                              calorieInfo: "1 gram carbs = 4 cals" 
                            },
                            { 
                              label: "Fats (g)", 
                              state: fats, 
                              setState: setFats, 
                              min: 25, 
                              max: 250, 
                              setter: setFatsValid, 
                              calorieInfo: "1 gram fats = 9 cals" 
                            },
                          ].map(({ label, state, setState, min, max, setter, readOnly, bgColor, cursor, calorieInfo }) => (
                            <div key={label} className="grid gap-2">
                              <Label className="text-base sm:text-lg">{label}</Label>
                              <div className="flex flex-col items-start space-y-1">
                                <Input
                                  type="number"
                                  placeholder={`${min} - ${max} (Optional)`}
                                  value={state || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                      setter(true);
                                    } else {
                                      const numericValue = parseInt(value);
                                      setState(numericValue);
                                      let cal = calories
                                      if(label=="Fats (g)"){
                                        cal = numericValue*9+(protein ? protein * 4 : 0)+ (carbs ? carbs * 4 : 0)
                                      }
                                      else if(label=="Carbs (g)"){
                                        cal = numericValue*4+(protein ? protein * 4 : 0)+ (fats ? fats * 9 : 0)
                                      }
                                      else if(label=="Protein (g)")
                                        cal = numericValue*4+(carbs ? carbs * 4 : 0)+ (fats ? fats * 9 : 0)
                                      setCalories(cal)
                                      validateInput(numericValue, min, max, setter);
                                    }
                                  }}
                                  readOnly={readOnly}
                                  className={`${bgColor || ""} ${cursor || ""} p-2 border rounded-md`}
                                />
                                {calorieInfo && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{calorieInfo}</p>
                                )}
                                {state && (state < min || state > max) && (
                                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                                    Value must be between {min} and {max}.
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleGenerateMeal}
                        disabled={isGenerating || !isFormValid}
                        size="sm"
                        className="w-full"
                      >
                        {isGenerating ? "This may take a while..." : "Generate Meal"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Select value={currentDay.toString()} onValueChange={(value) => setCurrentDay(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, index) => (
                      <SelectItem key={day} value={index.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {weeklyPlan[currentDay]?.meals.length > 0 ? (
                  weeklyPlan[currentDay].meals.map((meal, index) => (
                    <Card key={index} className="overflow-hidden bg-white dark:bg-gray-800">
                      <CardHeader className="bg-primary text-primary-foreground p-3 sm:p-4">
                        <CardTitle className="text-base sm:text-lg capitalize flex items-center">
                          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                          Meal {index + 1}
                          <button
                            onClick={() => handleDeleteMeal(index)}
                            className="ml-auto p-1 sm:p-2 bg-red-500 text-white rounded-full"
                          >
                            <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <Label className="w-20 sm:w-24 text-sm sm:text-base capitalize">Meal Type:</Label>
                            <Select
                              value={meal.type}
                              onValueChange={(value) => handleMealChange(index, { type: value as "quick" | "custom" | "saved" })}
                            >
                              <SelectTrigger className="w-[120px] sm:w-[150px]">
                                <SelectValue placeholder="Meal type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quick">Quick Add</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                                <SelectItem value="saved">Saved Recipe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {meal.type === "quick" && (
                            <div className="space-y-3 sm:space-y-4">
                              {meal.calories >= 0 && (
                                <Card className="bg-[#f0f7f4] shadow-md rounded-lg border border-gray-200 overflow-hidden">
                                  <CardContent className="p-4 sm:p-6">
                                    <h4 className="font-semibold text-lg sm:text-xl text-green-800 mb-2 sm:mb-3 border-b border-gray-300 pb-1 sm:pb-2">
                                      🍽️ Current Selection
                                    </h4>
                                    <div className="text-gray-700 text-sm sm:text-base">
                                      <p className="font-medium mb-1 sm:mb-2">
                                        {meal.name ? (
                                          <>
                                            <span className="font-bold text-gray-800">Name:</span> {meal.name}
                                          </>
                                        ) : (
                                          <span className="text-gray-500">No name set</span>
                                        )}
                                      </p>
                                      <p className="font-medium mb-1 sm:mb-2">
                                        <span className="font-bold text-green-600">Calories:</span> {meal.calories || "Not specified"}
                                      </p>
                                      <p className="font-medium mb-1 sm:mb-2">
                                        <span className="font-bold text-purple-600">Protein:</span> {meal.protein || "Not specified"} |
                                        <span className="font-bold text-yellow-600 ml-1 sm:ml-2">Fats:</span> {meal.fats || "Not specified"} |
                                        <span className="font-bold text-red-600 ml-1 sm:ml-2">Carbs:</span> {meal.carbs || "Not specified"}
                                      </p>
                                      <p className="font-medium">
                                        <span className="font-bold text-blue-500">Ingredients:</span>{" "}
                                        {meal.ingredients && meal.ingredients.length > 0 ? (
                                          <span className="text-gray-600">{meal.ingredients.join(", ")}</span>
                                        ) : (
                                          <span className="text-gray-400">No ingredients added</span>
                                        )}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}

                          {meal.type === "custom" && (
                            <MealComponent
                              meal={meal}
                              dayIndex={currentDay}
                              mealIndex={index}
                              handleMealChange={handleMealChange}
                            />
                          )}

                          {meal.type === "saved" && (
                            <MealComponentWithSearch
                              meal={meal}
                              dayIndex={currentDay}
                              mealIndex={index}
                              handleMealChange={handleMealChange}
                              savedRecipes={savedRecipes}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-primary/5 border border-primary text-primary rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center w-full">
                    <CardContent>
                      <div className="flex flex-col items-center justify-center h-40 sm:h-48">
                        <Utensils className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-primary" />
                        <h2 className="text-base sm:text-lg font-semibold mb-1">No meals added for this day.</h2>
                        <p className="text-xs sm:text-sm text-primary/80">Start building your plan by adding meals for today!</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <button
                onClick={addMeal}
                className="mt-4 sm:mt-6 mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-2 bg-primary text-primary-foreground rounded-lg sm:rounded-xl shadow hover:bg-primary/90 transition-colors text-sm sm:text-base"
              >
                ➕ Add Meal
              </button>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <Card className="bg-muted p-4 sm:p-6 rounded-lg shadow-md w-full sm:w-auto">
                  <CardContent className="p-0">
                    <p className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Total Calories: {totalCalories(weeklyPlan[currentDay])}</p>
                    <ul className="space-y-1 sm:space-y-2">
                      <li className="text-base sm:text-lg font-medium text-gray-700">
                        Protein: {totalProtein(weeklyPlan[currentDay])}g
                      </li>
                      <li className="text-base sm:text-lg font-medium text-gray-700">
                        Carbs: {totalCarbs(weeklyPlan[currentDay])}g
                      </li>
                      <li className="text-base sm:text-lg font-medium text-gray-700">
                        Fats: {totalFats(weeklyPlan[currentDay])}g
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Button 
                  onClick={handleSubmitPlan} 
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  Submit Plan
                </Button>
              </div>
            </div>
          )}
          
          <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Weekly Meal Plan Summary</DialogTitle>
              </DialogHeader>
              {renderMealPlanSummary()}
              <DialogFooter>
                <Button 
                  onClick={confirmMealPlan} 
                  size="sm" 
                  className="w-full mt-3 sm:mt-4 text-sm sm:text-base"
                >
                  Confirm Meal Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}