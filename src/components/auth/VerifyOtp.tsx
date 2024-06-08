// VerifyOTP.tsx

import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "@/components/ui/use-toast"
import { useVerifyUserMutation } from "@/redux/api/auth"
import { useAppDispatch } from "@/redux/hook"
import { setUser } from "@/redux/slices/user"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface VerifyOTPProps {
    tempUserId: string | null;
}

interface OTPFormInput {
    pin: string;
}

const VerifyOTP = ({ tempUserId }: VerifyOTPProps) => {
    const form = useForm<OTPFormInput>({
        defaultValues: {
            pin: "",
        },
    });
    const { control, handleSubmit, formState: { errors } } = form

    const [verifyUserApi] = useVerifyUserMutation();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();

    const verifyOtpHandler: SubmitHandler<OTPFormInput> = async (data) => {
        if (!tempUserId || data.pin.length !== 6) return;

        try {
            const res = await verifyUserApi({ userId: tempUserId, otp: parseInt(data.pin) }).unwrap();
            dispatch(setUser(res.data));
            router.push("/");
        } catch (error: any) {
            if (error.status === 401) toast({
                title: "Invalid OTP",
                description: "The OTP you've entered is invalid, please enter a valid OTP.",
                variant:"destructive"
            });
        }
    };

    return (
        <div className="flex justify-center items-center h-svh px-4 sm:px-0">
            <Card className="mx-auto max-w-sm w-full ce-auth">
                <CardHeader>
                    <CardTitle className="text-xl">Verify Your Account</CardTitle>
                    <CardDescription>
                        Enter the one-time password sent to your phone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(verifyOtpHandler)} className="w-full space-y-6">
                            <FormField
                                control={control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password</FormLabel>
                                        <FormControl>
                                            <Controller
                                                name="pin"
                                                control={control}
                                                rules={{ required: "OTP is required", minLength: { value: 6, message: "Your one-time password must be 6 characters." } }}
                                                render={({ field }) => (
                                                    <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                                                        <InputOTPGroup>
                                                            {[...Array(6)].map((_, index) => (
                                                                <InputOTPSlot key={index} index={index} className="w-14 h-12" />
                                                            ))}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage>
                                            {errors.pin && <span className="text-red-600 text-xs">{errors.pin.message}</span>}
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyOTP;
