"use server";

import dbConnect from "@/lib/db";
import { Slider } from "@/lib/models/Slider";
import { revalidatePath } from "next/cache";

export async function createSlider(data: any) {
  await dbConnect();
  
  try {
    const newSlider = await Slider.create(data);
    revalidatePath("/admin/sliders");
    return { success: true, data: JSON.parse(JSON.stringify(newSlider)) };
  } catch (error) {
    console.error("Error creating slider:", error);
    return { success: false, error: "Failed to create slider" };
  }
}

export async function getSliders() {
  await dbConnect();
  try {
    const sliders = await Slider.find({ isActive: true }).populate('products').lean();
    return { success: true, data: JSON.parse(JSON.stringify(sliders)) };
  } catch (error) {
    return { success: false, error: "Failed to fetch sliders" };
  }
}

export async function getSliderById(id: string) {
  await dbConnect();
  try {
    const slider = await Slider.findById(id).lean();
    return { success: true, data: JSON.parse(JSON.stringify(slider)) };
  } catch (error) {
    return { success: false, error: "Failed to fetch slider" };
  }
}

export async function updateSlider(id: string, data: any) {
  await dbConnect();
  try {
    await Slider.findByIdAndUpdate(id, data);
    revalidatePath("/admin/sliders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update slider" };
  }
}

export async function deleteSlider(id: string) {
  await dbConnect();
  try {
    await Slider.findByIdAndDelete(id);
    revalidatePath("/admin/sliders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete slider" };
  }
}
