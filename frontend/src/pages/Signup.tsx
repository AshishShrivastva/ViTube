import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Upload } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import Container from '../components/Container';
import conf from '../conf/conf';

export default function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm();

    const createAccount = async (data: any) => {
        setError("");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("fullname", data.fullname);
            formData.append("email", data.email);
            formData.append("username", data.username);
            formData.append("password", data.password);
            
            // Handle file uploads
            if (data.avatar && data.avatar[0]) {
                formData.append("avatar", data.avatar[0]);
            }
            if (data.coverImage && data.coverImage[0]) {
                formData.append("coverImage", data.coverImage[0]);
            }

            // API Call
            await axios.post(`${conf.backendUrl}/users/register`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            // On Success: Go to Login
            navigate("/login");
            
        } catch (error: any) {
            console.error("Signup Error:", error);
            setError(error.response?.data?.message || "Something went wrong during signup");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0F0F0F] text-white p-4">
            <Container>
                <div className="w-full max-w-lg mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                    
                    {/* Header */}
                    <div className="mb-6 flex flex-col items-center gap-2">
                        <Logo className="text-2xl" />
                        <h2 className="text-xl font-semibold text-gray-200">Create your account</h2>
                        <p className="text-gray-400 text-sm">Join the community of creators</p>
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-500/10 p-2 rounded-lg">{error}</p>}

                    {/* Form */}
                    <form onSubmit={handleSubmit(createAccount)} className="space-y-4">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Full Name" 
                                placeholder="John Doe" 
                                {...register("fullname", { required: true })} 
                            />
                            <Input 
                                label="Username" 
                                placeholder="@username" 
                                {...register("username", { required: true })} 
                            />
                        </div>

                        <Input 
                            label="Email" 
                            type="email" 
                            placeholder="you@example.com" 
                            {...register("email", { required: true })} 
                        />
                        
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••" 
                            {...register("password", { required: true })} 
                        />

                        {/* File Uploads */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Avatar (Required)</label>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    {...register("avatar", { required: true })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Cover Image (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                                {...register("coverImage")}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full mt-4" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Creating Account...
                                </div>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
                            Login here
                        </Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}