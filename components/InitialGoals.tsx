import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface NutritionDialogProps {
  initialData?: {
    currentWeight?: string;
    targetWeight?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fats?: string;
    goal?: string;
    lifestyle?: string;
  };
}

export default function NutritionDialog({ initialData = {} }: NutritionDialogProps) {
  const [formData, setFormData] = useState({
    currentWeight: initialData.currentWeight || "",
    targetWeight: initialData.targetWeight || "",
    calories: initialData.calories || "2000",
    protein: initialData.protein || "150",
    carbs: initialData.carbs || "250",
    fats: initialData.fats || "70",
    goal: initialData.goal || "",
    lifestyle: initialData.lifestyle || "",
  });

  const [isLbs, setIsLbs] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
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

  const handleSubmit = () => {
    console.log("User Nutrition Targets:", formData);
  };

  const isSuggestEnabled = formData.currentWeight && formData.targetWeight && formData.lifestyle && formData.goal;
  const isSaveEnabled = isSuggestEnabled && formData.calories && formData.protein && formData.carbs && formData.fats;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-100">Set Nutrition Goals</Button>
      </DialogTrigger>
      <DialogContent className="bg-green-50 border-green-500">
        <DialogHeader>
          <DialogTitle className="text-green-700">Nutrition Targets</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-green-700">Use lbs</Label>
            <Switch checked={isLbs} onCheckedChange={toggleUnit} className="bg-green-500" />
          </div>
          <div>
            <Label className="text-green-700">Current Weight ({isLbs ? "lbs" : "kg"})</Label>
            <Input className="border-green-400 focus:ring-green-500" name="currentWeight" value={formData.currentWeight} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-green-700">Target Weight ({isLbs ? "lbs" : "kg"})</Label>
            <Input className="border-green-400 focus:ring-green-500" name="targetWeight" value={formData.targetWeight} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-green-700">Lifestyle</Label>
            <Select onValueChange={(value) => handleSelectChange("lifestyle", value)}>
              <SelectTrigger className="border-green-400 focus:ring-green-500">
                <SelectValue placeholder="Select Lifestyle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary: x 1.2 (limited exercise)</SelectItem>
                <SelectItem value="lightly_active">Lightly active: x 1.375 (light exercise &lt;3 days/week)</SelectItem>
                <SelectItem value="moderately_active">Moderately active: x 1.55 (exercise most days)</SelectItem>
                <SelectItem value="very_active">Very active: x 1.725 (hard exercise every day)</SelectItem>
                <SelectItem value="extra_active">Extra active: x 1.9 (strenuous exercise 2+ times/day)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-green-700">Goal</Label>
            <Select onValueChange={(value) => handleSelectChange("goal", value)}>
              <SelectTrigger className="border-green-400 focus:ring-green-500">
                <SelectValue placeholder="Select Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="muscle_building">Muscle Building</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-green-500 text-white" disabled={!isSuggestEnabled}>Suggest Breakdown</Button>
          <div>
            <Label className="text-green-700">Calories</Label>
            <Input className="border-green-400 focus:ring-green-500" name="calories" value={formData.calories} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-green-700">Protein (g)</Label>
            <Input className="border-green-400 focus:ring-green-500" name="protein" value={formData.protein} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-green-700">Carbs (g)</Label>
            <Input className="border-green-400 focus:ring-green-500" name="carbs" value={formData.carbs} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-green-700">Fats (g)</Label>
            <Input className="border-green-400 focus:ring-green-500" name="fats" value={formData.fats} onChange={handleChange} />
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmit} disabled={!isSaveEnabled}>Save Goals</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
