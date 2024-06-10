"use client"

import { useAppSelector } from "@/redux/hook";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FaYoutube } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const Setting = () => {
    const { user } = useAppSelector(state => state.user);
    const router = useRouter();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone
        }
    });

    const watchedValues = watch();

    const isInputChanged = () => {
        return watchedValues.name !== user.name || watchedValues.email !== user.email;
    };

    const onSubmit = (data: any) => {
        console.log(data);
        // Handle form submission
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="flex justify-start border-b-2 border-gray-300">
                <div className="text-red-500 font-medium border-red-500 border-b-2 p-2" style={{ marginBottom: "-1px" }}>Profile</div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 mt-6">
                <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" {...register("name", { required: true })} id="name" placeholder="Name" />
                    {errors.name && <span className="text-red-500">This field is required</span>}
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" {...register("email")} disabled placeholder="Email" />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
                    <Label htmlFor="phone">Phone</Label>
                    <Input type="number" id="phone" {...register("phone")} placeholder="Phone" />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
                    <Label htmlFor="link">Link</Label>
                    <div className="flex">
                        <FcGoogle size={30} onClick={() => !user.is_google_authenticated && router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)} className={`mr-3 cursor-pointer ${user.is_google_authenticated ? "opacity-60" : ""}`} />
                        <FaYoutube size={30} onClick={() => !user.is_youtube_authenticated && router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/youtube`)} className={`mr-3 cursor-pointer ${user.is_youtube_authenticated ? "opacity-60" : ""}`} color="#FF0000" />
                    </div>
                </div>

                <Button type="submit" className="w-24 mt-4" disabled={!isInputChanged()}>Save</Button>
            </form>
        </div>
    );
}

export default Setting;
