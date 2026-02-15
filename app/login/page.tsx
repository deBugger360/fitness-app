import AuthForm from "@/features/auth/components/AuthForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <AuthForm />
            </div>
        </div>
    );
}
