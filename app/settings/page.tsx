"use client"
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import { Heart, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {useRouter} from 'next/navigation'
import { useEffect } from "react";
import Alert from '@/components/Alert';

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
export default function SettingsPage() {
  const { register, getValues,setValue,control } = useForm();

  const [activeSection, setActiveSection] = useState("targets");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [userID, setUserID] = useState(null)
  const [birthday,setBirthday] = useState("")
  const [sex,setSex] = useState("")
  const [weightInPounds,setWeightInPounts] = useState(150)
  const [weightInPounds2,setWeightInPounts2] = useState(150)
  const [currentSettings,setCurrentSettings] = useState({
    currentWeight: 70,
    targetWeight : 70,
    calories: 20,
    carbs: 20,
    protein: 20,
    fats: 20,
    height: 0,
    lifestyle: "chill",
    goals: "Well Good"
  })
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [updating,setUpdating] = useState(false)

  const [isLbs, setIsLbs] = useState(true);
  const [editableSettings, setEditableSettings] = useState(() => ({
    ...currentSettings,
  }));
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
          setSex(res.data.sex)
          setBirthday(res.data.birthday)
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, []);
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');  // This can be 'success', 'error', etc.
  const [alertMessage, setAlertMessage] = useState('');
  
  const resetInputs = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOldEmail('');
    setNewEmail('');
    setConfirmNewEmail('');
  };
  useEffect(() => {
    if (userID) {
      
      const fetchCalories = async () => {
        try {
          const res = await axios.post(
            'https://express-vercel-nutritrack.vercel.app/get-current-settings',
            { id: userID },
            { withCredentials: true }
          );
          setCurrentSettings(res.data.settings)
          setEditableSettings(res.data.settings)
          setWeightInPounts(res.data.settings.targetWeight)
          setWeightInPounts2(res.data.settings.currentWeight)
        } catch (error) {
          console.error('Error during fetching saved recipes:', error);
          router.push('/');
        }
        finally {
          setLoading(false); // Stop loading after fetch
          
        }
      };
      fetchCalories();
    }
  }, [userID]);

  const toggleUnit = () => {
    const newIsLbs = !isLbs;
    setIsLbs(newIsLbs);
  
    // Keep currentWeight and targetWeight as floats
    setCurrentSettings({
      ...currentSettings,
      currentWeight: currentSettings.currentWeight
        ? newIsLbs
          ? weightInPounds2  // Convert and round to 1 decimal
          : Math.round((currentSettings.currentWeight / 2.205) * 10) / 10  // Convert and round to 1 decimal
        : 0,
      targetWeight: currentSettings.targetWeight
        ? newIsLbs
          ? weightInPounds  // Convert and round to 1 decimal
          : Math.round((currentSettings.targetWeight / 2.205) * 10) / 10  // Convert and round to 1 decimal
        : 0,
    });
  };
  const handleUpdate = async (key:string) =>{
    setUpdating(true)
    const formValues = getValues();
    let updatedValue = formValues[key];
    const ogVal = updatedValue
    
    if(Number.isNaN(updatedValue)){
      setUpdating(false)
      return

    }
 
    if(key =="targetWeight"){
      if(!isLbs)
        updatedValue = Math.round(updatedValue * 2.205 * 10) / 10;;
        setWeightInPounts(updatedValue)
     }
     if(key =="currentWeight"){
      if(!isLbs)
        
        updatedValue = Math.round(updatedValue * 2.205 * 10) / 10;
        setWeightInPounts2(updatedValue)
     }
    console.log(updatedValue);
    await axios.post(
      'https://express-vercel-nutritrack.vercel.app/update-goals',{
        goal: key, 
        value: updatedValue,
        id: userID
      }
    )
    setValue(key, '');
    
    updatedValue = ogVal
    
    setCurrentSettings(prevSettings => ({
        ...prevSettings,  
        [key]: updatedValue  
    }));
    
    
    setUpdating(false)
  }
  const handleMacros = async (key:string) =>{
      type EditableSettings = typeof editableSettings;
      await axios.post(
        'https://express-vercel-nutritrack.vercel.app/update-goals',{
          goal: key, 
          value: editableSettings[key as keyof EditableSettings],
          id: userID
        }
      )
      
      
      setCurrentSettings((prev) => {
        const updated = {
          ...prev,
          [key]: editableSettings[key as keyof EditableSettings], // editableSettings stores string input
        };
        
        if (["protein", "carbs", "fats"].includes(key)) {
          const protein =
            key === "protein" ? editableSettings["protein"] || 0 : prev.protein;
          const carbs =
            key === "carbs" ? editableSettings[key] || 0 : prev.carbs;
          const fats =
            key === "fats" ? editableSettings[key] || 0 : prev.fats;
      
          updated.calories = protein * 4 + carbs * 4 + fats * 9;
          console.log(protein);
          console.log(carbs);
          console.log(fats);
          console.log(updated.calories);
          
        }
      
        return updated;
      });
   
  }
  const handleBreakDown = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const response = await axios.post('https://express-vercel-nutritrack.vercel.app/suggest-breakdown', {
        height: currentSettings.height,
        curWeight: currentSettings.currentWeight,
        targetWeight: currentSettings.targetWeight,
        lifestyle: currentSettings.lifestyle,
        goal: currentSettings.goals,
        sex: sex,
        birthday: birthday,
        isKg: !isLbs
    });


    setEditableSettings((prev) => {
      const updated = {
        ...prev,
        calories: response.data.calories,
        fats: response.data.fats,
        carbs: response.data.carbs,
        protein: response.data.protein
      };

      return updated;
    });
  };
 
  const handleEmailPassWordChange = async () => {
    if (dialogType === 'email') {
  
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (![oldEmail, newEmail, confirmNewEmail].every(email => emailRegex.test(email))) {
        return handleError("invalidEmail");
      }
    
      if (newEmail !== confirmNewEmail) {
        return handleError("EmailMismatch");
      }
    
      try {
        const { data } = await axios.post('https://express-vercel-nutritrack.vercel.app/change-email', {
          userID,
          oldEmail,
          newEmail
        });
    
        const errorMap: { [key: string]: string } = {
          "Incorrect Old Email": "IncorrectOldEmail",
          "New email is already in use": "emailInUse",
        };
        
        return errorMap[data.message] ? handleError(errorMap[data.message]) : (setDialogOpen(false),resetInputs());
      } catch (error) {
        console.error("Error updating email:", error);
      }
  }
  else{
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (![newPassword].every(pass => passwordRegex.test(pass))) {
      return handleError("invalidPassword");
    }
    
    if (newPassword !== confirmNewPassword) {
      return handleError("passwordMismatch");
    }
    
    
  
    try {
      const { data } = await axios.post('https://express-vercel-nutritrack.vercel.app/change-password', {
        userID,
        oldPassword,
        newPassword
      });

  
      const errorMap: { [key: string]: string } = {
        "Incorrect Old Password": "IncorrectOldPassword",
      };
  
      return errorMap[data.message] ? handleError(errorMap[data.message]) : (setDialogOpen(false),resetInputs());
    } catch (error) {
      console.error("Error updating password:", error);
    }
  }
  };
  
  const handleError = (errorType:string) => {
    switch (errorType) {
      case 'emailInUse':
        setAlertMessage('This email is already in use.');
        setAlertType('error');
        break;
      case 'IncorrectOldEmail':
          setAlertMessage('You entered the incorrect current email');
          setAlertType('error');
          break;
      case 'IncorrectOldPassword':
            setAlertMessage('You entered the incorrect current password');
            setAlertType('error');
            break;
      case 'invalidEmail':
        setAlertMessage('Please enter a valid email address in all the fields.');
        setAlertType('error');
        break;
      case 'passwordMismatch':
        setAlertMessage('Passwords do not match.');
        setAlertType('error');
        break;
      case 'EmailMismatch':
        setAlertMessage('Emails do not match.');
        setAlertType('error');
        break;
      case 'networkError':
        setAlertMessage('There was an issue connecting to the server. Please try again later.');
        setAlertType('error');
        break;
      case 'invalidPassword':
        setAlertMessage('The password should include a captial letter, a special character , a number and atleast 8 characters');
        setAlertType('error');
        break
      case 'success':
        setAlertMessage('Your changes have been saved successfully!');
        setAlertType('success');
        break;
      default:
        setAlertMessage('Something went wrong.');
        setAlertType('error');
    }
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  
  const handleInputChange = (key: string, newValue: string) => {
    newValue = newValue.replace(/[^0-9]/g, "");
  
    setEditableSettings((prev) => {
      const updated = {
        ...prev,
        [key]: newValue,
      };
  
      if (["protein", "carbs", "fats"].includes(key)) {
        const protein = parseInt(key === "protein" ? newValue : String(prev.protein)) || 0;
        const carbs = parseInt(key === "carbs" ? newValue : String(prev.carbs)) || 0;
        const fats = parseInt(key === "fats" ? newValue : String(prev.fats)) || 0;
  
        updated.calories = protein * 4 + carbs * 4 + fats * 9;
      }
  
      return updated;
    });
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 min-h-screen bg-green-50 rounded-lg shadow-lg">
    {/* Header */}
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/90 backdrop-blur-lg dark:bg-gray-800/90 sticky top-0 z-50 shadow-md">
      <Link className="flex items-center justify-center" href="#">
        <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
        <span className="ml-2 text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">NutriTrack</span>
      </Link>
      <nav className="ml-auto hidden md:flex items-center gap-6">
        <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/meal_log">
          Meal Log
        </Link>
        <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/saved_meals">
          Saved Recipes
        </Link>
        <Link className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-300" href="/meal_log">
          Meal Log
        </Link>
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
    <div className="flex w-full gap-10">
      {/* Sidebar */}
      <div className="w-1/4 border-r pr-6 bg-green-100 p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Settings</h1>
        <nav className="space-y-4 text-gray-700">
          <p className={`cursor-pointer hover:text-black ${activeSection === "targets" ? "font-bold text-green-700" : ""}`} onClick={() => setActiveSection("targets")}>Targets</p>
          <p className={`cursor-pointer hover:text-black ${activeSection === "personalInfo" ? "font-bold text-green-700" : ""}`} onClick={() => setActiveSection("personalInfo")}>Modify Personal Information</p>
        </nav>
      </div>
  
      {/* Main Section */}
      <div className="w-3/4 space-y-6">
        {updating && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        )}
        {activeSection === "targets" && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-700">Goals and Nurtition</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Section 1: General Settings */}
<h2 className="text-lg font-semibold text-gray-700 mb-2">Target Settings</h2>
<div className="flex items-center justify-start">
            <Label className="text-green-700">Use lbs   </Label>
            <Switch checked={isLbs} onCheckedChange={toggleUnit} className="bg-green-500 ml-2" />

          </div>
{Object.entries(currentSettings).slice(0, 5).map(([key, value]) => (
  <div key={key} className="flex items-center gap-4">
    <div className="w-2/3" >
      <label className="block text-sm font-medium capitalize flex items-center gap-2">
        {key.replace(/([A-Z])/g, " $1")} {key === "height" ? <div>(cm)</div> : null}
      </label>
      <p className="text-gray-500 text-sm">Current: {value}</p>

      {/* Conditional UI for each key */}
      {key === "targetWeight" || key === "currentWeight" ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            {...register(key, { valueAsNumber: true })}
            className="flex-grow"
            min="0" // Prevent negative numbers
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              e.target.value = value < 0 ? "0" : value.toString();
            }}
          />
          
          <Button
            className="bg-green-500 text-white"
            onClick={() => handleUpdate(key)}
          >
            Update
          </Button>
        </div>
      ) : key === "lifestyle" ? (
        <div className="flex items-center gap-2">
          <Controller
        name="lifestyle"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="border-green-400 focus:ring-green-500 mt-2">
              <SelectValue placeholder="Select Lifestyle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sedentary">Sedentary (limited exercise)</SelectItem>
              <SelectItem value="Lightly Active">Lightly active (exercise less than 3 days/week)</SelectItem>
              <SelectItem value="Moderately Active">Moderately active (exercise most days)</SelectItem>
              <SelectItem value="Very Active">Very active (hard exercise every day)</SelectItem>
              <SelectItem value="Extra Active">Extra active (strenuous exercise 2x/day)</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
          <Button
              className="bg-green-500 text-white"
              onClick={() => handleUpdate(key)}
            >
              Update
            </Button>
        </div>
      ) : key === "goals" ? (
        <div className="flex items-center gap-2">
          <Controller
            name="goals"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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
                )}
          />
            <Button
              className="bg-green-500 text-white"
              onClick={() => handleUpdate(key)}
            >
              Update
            </Button>
          
        </div>
      ):(
        <div className="flex items-center gap-4">
          <Input
            type="number"
            {...register(key, { valueAsNumber: true })}
            className="flex-grow"
            min="0" // Prevent negative numbers
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              e.target.value = value < 0 ? "0" : value.toString();
            }}
          />
          <Button
            className="bg-green-500 text-white"
            onClick={() => handleUpdate(key)}
          >
            Update
          </Button>
        </div>
      )}
    </div>
  </div>
))}

{/* Section 2: Nutritional Information */}
<h2 className="text-lg font-semibold text-gray-700 mt-6 mb-2">
  Nutritional Information
</h2>
<div className="mt-4 border-t border-gray-300 pt-4 flex items-center justify-start gap-4">
            <p className="text-gray-600">Need help with macro and calorie targets based on settings above?</p>

            <div className="relative group">
                <Button 
                className="bg-green-500 text-white py-3 px-4" 
                onClick={handleBreakDown}
                >
                Suggest Breakdown
                </Button>

                {/* Improved Tooltip */}
                

            </div>
        </div>
        {Object.entries(currentSettings)
        .slice(5, 9)
        .map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-2/3">
              <label className="block text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <p className="text-gray-500 text-sm">Current: {value}</p>

              {/* Read-only Calories */}
              {key === "calories" ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="bg-green-100 flex-grow cursor-not-allowed"
                    readOnly
                    value={editableSettings.calories}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editableSettings[key as keyof typeof editableSettings]}
                    {...register(key, { valueAsNumber: true })}
                    step="1"
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="flex-grow"
                  />
                  <span className="text-xs text-gray-500 italic">
                    {key === "protein" && "Protein: 4 kcal/g"}
                    {key === "carbs" && "Carbs: 4 kcal/g"}
                    {key === "fats" && "Fat: 9 kcal/g"}
                  </span>
                  <Button
                    className="bg-green-500 text-white"
                    onClick={() => handleMacros(key)}
                  >
                    Update
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

            </CardContent>
          </Card>
        )}
  
        {activeSection === "personalInfo" && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-700">Modify Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2/3">
                  <label className="block text-sm font-medium">Change Email</label>
                </div>
                <Button className="bg-green-500 text-white" onClick={() => { setDialogType("email"); setDialogOpen(true); }}>Update</Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2/3">
                  <label className="block text-sm font-medium">Change Password</label>
                </div>
                <Button className="bg-green-500 text-white" onClick={() => { setDialogType("password"); setDialogOpen(true); }}>Update</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {dialogType === "email" ? "Email Change" : "Password Change"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Conditionally render the type of the first input based on dialogType */}
          <Input 
              placeholder={dialogType === "email" ? "Enter Old Email" : "Enter Old Password"} 
              type={dialogType === "email" ? "email" : "password"} 
              value={dialogType === "email" ? oldEmail : oldPassword} // Directly pass the value
              onChange={dialogType === "email" 
                ? (e) => setOldEmail(e.target.value) 
                : (e) => setOldPassword(e.target.value)
              }
              required
          />
          
          {/* Conditional rendering for email or password change */}
          {dialogType === "email" ? (
            <>
              <Input 
                placeholder="Enter New Email" 
                type="email" 
                required 
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" 
                title="Please enter a valid email address"
                value = {newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Input 
                placeholder="Confirm New Email" 
                type="email" 
                required 
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" 
                title="Please confirm your email address"
                value = {confirmNewEmail}
                onChange={(e) => setConfirmNewEmail(e.target.value)}
              />
            </>
          ) : (
            <>
              <Input 
                placeholder="Enter New Password" 
                type="password" 
                minLength={8} 
                pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})" 
                title="Password must contain at least 8 characters, one uppercase letter, one number, and one special character"
                required
                value = {newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input 
                placeholder="Confirm New Password" 
                type="password" 
                minLength={8} 
                pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})" 
                title="Password must match the criteria"
                required
                value = {confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </>
          )}
          
          <Button className="bg-green-500 text-white w-full" onClick={() => { setShowAlert(false);handleEmailPassWordChange();  }}>Confirm</Button>
          {showAlert && (
          <Alert 
            type={alertType}
            message={alertMessage}
            onClose={handleCloseAlert}
          />
        )}
        </div>
        </DialogContent>
    </Dialog>
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 NutriTrack. All rights reserved.</p>
        </div>
      </footer>
  </div>
  );
}
