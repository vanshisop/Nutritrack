"use client"
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Heart, Menu} from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FaArrowLeft,FaUser, FaEnvelope, FaLock, FaVenusMars, FaBirthdayCake, FaWeight, FaBalanceScale, FaRunning, FaBullseye, FaRuler } from "react-icons/fa";
import axios from "axios";
import { useRouter } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


export default function RegistrationPage() {
  // Registration state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const getMinDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 15);
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };
  // Nutrition state
  const [formData, setFormData] = useState({
    fullName: "",
    registerEmail: "",
    password: "",
    confirmPassword: "",
    sex: "",
    birthday: "",
    currentWeight: "",
    targetWeight: "",
    height: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    goal: "",
    lifestyle: "",
  });

  const [isLbs, setIsLbs] = useState(true);
  const router = useRouter();
  // Handle input changes for registration form
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    

    // Update formData, ensuring it's always a valid number
    const updatedFormData = { 
        ...formData,
        [name]: value // Keep as string for input compatibility
    };

    // Convert values for calculations
    const protein = Number(updatedFormData.protein) || 0;
    const carbs = Number(updatedFormData.carbs) || 0;
    const fats = Number(updatedFormData.fats) || 0;

    // Calculate calories
    const calories = (protein * 4) + (carbs * 4) + (fats * 9);

    // Set the updated state
    setFormData({ 
        ...updatedFormData,
        calories: calories > 0 ? calories.toString() : "" 
    });
    };


  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const toggleUnit = () => {
    setIsLbs(!isLbs);
    setFormData({
      ...formData,
      currentWeight: formData.currentWeight ? (isLbs ? (parseFloat(formData.currentWeight) / 2.205).toFixed(1) : (parseFloat(formData.currentWeight) * 2.205).toFixed(1)) : "",
      targetWeight: formData.targetWeight ? (isLbs ? (parseFloat(formData.targetWeight) / 2.205).toFixed(1) : (parseFloat(formData.targetWeight) * 2.205).toFixed(1)) : "",
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setPasswordError("")
    setEmailError("")
    e.preventDefault();
    if(formData.password!=formData.confirmPassword){
        setPasswordError("Your passwords do not match")
        window.scrollTo({ top: 0, behavior: "smooth" });
        return
    }
    const response = await axios.post('https://express-vercel-nutritrack.vercel.app/add-registration', {
        fullName: formData.fullName,
        registerEmail: formData.registerEmail,
        password: formData.password,
        sex: formData.sex,
        birthday: formData.birthday,
        curWeight: formData.currentWeight,
        targetWeight: formData.targetWeight,
        lifestyle: formData.lifestyle,
        goals: formData.goal,
        height: formData.height,
        isKg: !isLbs,
        calories: formData.calories,
        carbs: formData.carbs,
        fats: formData.fats,
        protein: formData.protein
        
    });
    if(response.data.isRegistered && response.data.password){
        toast.success("Registration Successful! You are being redirected to Login Page.");

        setTimeout(() => {
          router.push('/'); 
        }, 3500);
      }
      else{
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (!response.data.isRegistered)
          setEmailError("This email is already in use. Please login or use another email")
        else
          setEmailError("")
        
        if (!response.data.password)
          setPasswordError("Please choose a valid password")
        else 
          setPasswordError("")

          
  
      }
  };
  const handleBreakDown = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const response = await axios.post('https://express-vercel-nutritrack.vercel.app/suggest-breakdown', {
        sex: formData.sex,
        birthday: formData.birthday,
        height: formData.height,
        curWeight: formData.currentWeight,
        targetWeight: formData.targetWeight,
        lifestyle: formData.lifestyle,
        goal: formData.goal,
        isKg: !isLbs
    });

    setFormData({
        ...formData,
        calories : response.data.calories,
        protein : response.data.protein,
        fats: response.data.fats,
        carbs: response.data.carbs
      });
    
  };

  const isSuggestEnabled = formData.currentWeight && formData.targetWeight && formData.lifestyle && formData.goal && formData.birthday && formData.fullName && formData.registerEmail && formData.password && formData.confirmPassword && formData.sex;
  const isSaveEnabled = isSuggestEnabled && formData.calories && formData.protein && formData.carbs && formData.fats;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 to-teal-100 dark:from-green-800 dark:to-teal-800">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/90 backdrop-blur-lg dark:bg-green-900 sticky top-0 z-50 shadow-md">
        <Link className="flex items-center justify-center" href="#">
          <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">NutriTrack</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-6">
        <Link
  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:underline focus:outline-none transition-colors duration-300 ease-in-out flex items-center"
  href="/"
>
  <FaArrowLeft className="mr-2 w-4 h-4" /> {/* Left arrow icon */}
  Back to Login
</Link>
         

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
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <ToastContainer/>
      <div className="w-[70%] mx-auto p-8 bg-white rounded-lg shadow-lg mt-16">
      
      <h2 className="text-3xl font-bold text-green-600 mb-8">Create Your Account</h2>
      
      <form className="space-y-8">
        {/* User Registration Form */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="register-name" className="text-green-700 flex items-center gap-2">
              <FaUser className="text-green-600" />
              Full Name
            </Label>
            <Input 
              id="register-name" 
              placeholder="Enter your full name" 
              name="fullName" 
              value={formData.fullName}
              onChange={handleChange}
              className="mt-2"
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="register-email" className="text-green-700 flex items-center gap-2">
              <FaEnvelope className="text-green-600" />
              Email
            </Label>
            <Input 
              id="register-email" 
              placeholder="Enter your email" 
              type="email" 
              name="registerEmail" 
              value={formData.registerEmail}
              onChange={handleChange}
              className="mt-2"
              required 
            />
            {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
          </div>
          
          <div>
            <Label htmlFor="register-password" className="text-green-700 flex items-center gap-2">
              <FaLock className="text-green-600" />
              Password
            </Label>
            <Input 
              id="register-password" 
              placeholder="Create a password" 
              type="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              className="mt-2"
              required 
            />
            {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
            <p className="text-green-500 text-sm mt-2">Choose a password with at least 8 characters, one uppercase letter, and one special character</p>
          </div>

          <div>
            <Label htmlFor="register-confirm-password" className="text-green-700 flex items-center gap-2">
              <FaLock className="text-green-600" />
              Confirm Password
            </Label>
            <Input 
              id="register-confirm-password" 
              placeholder="Confirm your password" 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-2"
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="register-sex" className="text-green-700 flex items-center gap-2">
              <FaVenusMars className="text-green-600" />
              Sex
            </Label>
            <Select onValueChange={(value) => handleSelectChange("sex", value)} required>
              <SelectTrigger className="border-green-400 focus:ring-green-500 mt-2">
                <SelectValue placeholder="Select your sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="register-birthday" className="text-green-700 flex items-center gap-2">
              <FaBirthdayCake className="text-green-600" />
              Birthday
            </Label>
            <Input 
              id="register-birthday" 
              type="date" 
              name="birthday" 
              value={formData.birthday} 
              onChange={handleChange}
              className="mt-2"
              max={getMinDate()}
              required 
            />
          </div>
        </div>
        
        {/* Nutrition Goals Form */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-green-700">Use lbs</Label>
            <Switch checked={isLbs} onCheckedChange={toggleUnit} className="bg-green-500" />
          </div>

          <div>
            <Label className="text-green-700 flex items-center gap-2">
                <FaWeight className="text-green-600" />
                Current Weight ({isLbs ? "lbs" : "kg"})
            </Label>
            <Input
                type="number"
                className="border-green-400 focus:ring-green-500 mt-2"
                name="currentWeight"
                value={formData.currentWeight}
                onChange={handleChange}
                inputMode="decimal"
                pattern="[0-9]*"
                onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                    e.preventDefault();
                }
                }}
            />
        </div>

        <div>
        <Label className="text-green-700 flex items-center gap-2">
            <FaBalanceScale className="text-green-600" />
            Target Weight ({isLbs ? "lbs" : "kg"})
        </Label>
        <Input
            type="number"
            className="border-green-400 focus:ring-green-500 mt-2"
            name="targetWeight"
            value={formData.targetWeight}
            onChange={handleChange}
            inputMode="decimal"
            pattern="[0-9]*"
            onKeyDown={(e) => {
            if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                e.preventDefault();
            }
            }}
        />
        </div>

          
          <div>


            
          <Label className="text-green-700 flex items-center gap-2">
                <FaRuler className="text-green-600" />
                    Height
                </Label>
                <div className="flex gap-2">
                <Input
                    type="number"
                    className="border-green-400 focus:ring-green-500 mt-2 p-2 rounded-lg w-20"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="120"
                    max="220"
                />
                <span className="text-green-700 mt-3">cm</span>
                
                </div>
          </div>

          <div>
            <Label className="text-green-700 flex items-center gap-2">
              <FaRunning className="text-green-600" />
              Lifestyle
            </Label>
            <Select onValueChange={(value) => handleSelectChange("lifestyle", value)}>
              <SelectTrigger className="border-green-400 focus:ring-green-500 mt-2">
                <SelectValue placeholder="Select Lifestyle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sedentary">Sedentary(limited exercise)</SelectItem>
                <SelectItem value="Lightly Active">Lightly active(light exercise less than 3 days per week)</SelectItem>
                <SelectItem value="Moderately Active">Moderately active(moderate exercise most days of the week)</SelectItem>
                <SelectItem value="Very Active">Very active(hard exercise every day)</SelectItem>
                <SelectItem value="Extra Active">Extra active(strenuous exercise two or more times per day)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-green-700 flex items-center gap-2">
              <FaBullseye className="text-green-600" />
              Goal
            </Label>
            <Select onValueChange={(value) => handleSelectChange("goal", value)}>
              <SelectTrigger className="border-green-400 focus:ring-green-500 mt-2">
                <SelectValue placeholder="Select Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintenance / General Fitness">Maintenance / General Fitness</SelectItem>
                <SelectItem value="Muscle Building">Muscle Building</SelectItem>
                <SelectItem value="Endurance">Endurance</SelectItem>
                <SelectItem value="Athletic Performance">Athletic Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 border-t border-gray-300 pt-4 flex items-center justify-start gap-4">
            <p className="text-gray-600">Need help with macro and calorie targets?</p>

            <div className="relative group">
                <Button 
                className="bg-green-500 text-white py-3 px-4" 
                disabled={!isSuggestEnabled} 
                onClick={handleBreakDown}
                >
                Suggest Breakdown
                </Button>

                {/* Improved Tooltip */}
                <div className="absolute left-1/2 top-full mt-2 w-72 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-1.5 px-4 opacity-0 scale-95 transition-all group-hover:opacity-100 group-hover:scale-100 shadow-lg">
  <div className="absolute left-1/2 -top-1 w-3 h-3 bg-gray-800 rotate-45 -translate-x-1/2"></div>
  <span className="font-medium">Fill out these fields:</span>
  <div className="mt-1 text-xs">Sex, Birthday, Current Weight, Target Weight, Height, Lifestyle, Goal</div>
</div>

            </div>
        </div>
        
          <div>
            <Label className="text-green-700">Calories</Label>
            <p className="text-sm text-gray-500">Calories are generated based on macros entered below.</p>
            <Input 
                className="border-green-400 bg-green-100 text-green-800 font-semibold focus:ring-green-500 mt-2 cursor-not-allowed" 
                name="calories" 
                value={formData.calories} 
                onChange={handleChange} 
                readOnly
            />
        </div>

        <div>
                <Label className="text-green-700">Protein (g)</Label>
                <Input 
                    type="number"
                    min="1" 
                    max="500"
                    className="border-green-400 focus:ring-green-500 mt-2" 
                    name="protein" 
                    value={formData.protein} 
                    onChange={handleChange} 
                    onBlur={(e) => setFormData({...formData, [e.target.name]: Math.min(500, Math.max(1, Number(e.target.value))).toString() })}
                />
                </div>

                <div>
                <Label className="text-green-700">Carbs (g)</Label>
                <Input 
                    type="number"
                    min="1" 
                    max="500"
                    className="border-green-400 focus:ring-green-500 mt-2" 
                    name="carbs" 
                    value={formData.carbs} 
                    onChange={handleChange} 
                    onBlur={(e) => setFormData({...formData, [e.target.name]: Math.min(500, Math.max(0, Number(e.target.value))).toString() })}
                />
                </div>

                <div>
                <Label className="text-green-700">Fats (g)</Label>
                <Input 
                    type="number"
                    min="1" 
                    max="500"
                    className="border-green-400 focus:ring-green-500 mt-2" 
                    name="fats" 
                    value={formData.fats} 
                    onChange={handleChange} 
                    onBlur={(e) => setFormData({...formData, [e.target.name]: Math.min(500, Math.max(0, Number(e.target.value))).toString() })}
                />
            </div>


          <Button className="bg-green-600 hover:bg-green-700 text-white w-full py-3" onClick={handleSubmit} disabled={!isSaveEnabled}>
            Save Nutrition Goals
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
}