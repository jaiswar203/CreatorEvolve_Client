import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import "./auth.css";
import { useLoginUserMutation, useSignUpUserMutation } from "@/redux/api/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setUser } from "@/redux/slices/user";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

interface IAuthProp {
    isLogin?: boolean;
    onSuccessfulSignup?: (userId: string) => void;
}

interface IFormInput {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
}

const Auth = ({ isLogin = false, onSuccessfulSignup }: IAuthProp) => {
    const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.user)
    const router = useRouter();
    const { toast } = useToast();

    const [loginUserApi, { isLoading: isLoginLoading }] = useLoginUserMutation();
    const [signUpUserApi, { isLoading: isSignUpLoading }] = useSignUpUserMutation();

    const isLoading = isLoginLoading || isSignUpLoading;

    useEffect(() => {
        if (user?._id || user?.access_token) router.push("/")
    }, [user])

    const onLoginSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            const res = await loginUserApi({ email: data.email, password: data.password }).unwrap();
            dispatch(setUser(res?.data));
            router.push('/');
        } catch (error: any) {
            if (error.status === 401) toast({
                title: 'Invalid email or password',
                description: "Please enter a valid email and password.",
                variant: "destructive"
            });
        }
    };

    const onSignUpHandler: SubmitHandler<IFormInput> = async (data) => {
        try {
            const res = await signUpUserApi({ email: data.email, password: data.password, name: `${data.firstName} ${data.lastName}` }).unwrap();
            toast({
                title: 'Verification email sent',
                description: 'Check your email for the OTP and enter it here.'
            });
            if (onSuccessfulSignup) onSuccessfulSignup(res.data?.userId);
        } catch (error: any) {
            if (error.status === 400 && error.data?.exist) toast({
                title: 'Email already in use',
                description: "Please use a different email.",
                variant: "destructive"
            });
        }
    };

    const onSubmit = isLogin ? onLoginSubmit : onSignUpHandler;

    const renderNameFields = () => (
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" placeholder="John" {...register("firstName", { required: true })} />
                {errors.firstName && <span className="text-red-600 text-xs">First name is required</span>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Doe" {...register("lastName", { required: true })} />
                {errors.lastName && <span className="text-red-600 text-xs">Last name is required</span>}
            </div>
        </div>
    );

    const renderPasswordField = () => (
        <div className="grid gap-2">
            {isLogin ? (
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot password?
                    </Link>
                </div>
            ) : (
                <Label htmlFor="password">Password</Label>
            )}
            <Input id="password" type="password" {...register("password", { required: true })} />
            {errors.password && <span className="text-red-600 text-xs">Password is required</span>}
        </div>
    );

    return (
        <div className="flex justify-center items-center h-svh px-4 sm:px-0">
            <Card className="mx-auto max-w-sm w-full ce-auth">
                <CardHeader>
                    <div className="flex items-center">
                        <Image src={"/assets/icon.webp"} width={50} height={50} className="rounded-full mr-4" alt="CL" />
                        <CardTitle className="text-xl">{isLogin ? "Login" : "Welcome"} to CreatorEvolve</CardTitle>
                    </div>
                    <CardDescription className="text-center">
                        {isLogin ? "Enter your credentials to log in." : "Fill in your details to create an account."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        {!isLogin && renderNameFields()}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" {...register("email", { required: true })} />
                            {errors.email && <span className="text-red-600 text-xs">Email is required</span>}
                        </div>
                        {renderPasswordField()}
                        <Button type="submit" className="w-full" loading={{ isLoading }}>
                            {isLogin ? "Login" : "Create Account"}
                        </Button>
                        <Button variant="outline" className="w-full" type="button" onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)}>
                            <FcGoogle size={25} className="mr-1" />
                            {isLogin ? "Sign in" : "Sign up"} with Google
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <Link href={`/auth/${isLogin ? "signup" : "login"}`} className="underline">
                            {isLogin ? "Sign up" : "Sign in"}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;
