import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import eklesiaLogo from '../../assets/eklesia_logo.png';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', churchName: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const tenantId = formData.churchName.toLowerCase().replace(/\s+/g, '-');

            await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                churchName: formData.churchName,
                tenantId: tenantId
            });
            alert('Pendaftaran berhasil! Silakan Sign In.');
            navigate('/login');
        } catch (error: any) {
            alert('Gagal mendaftar: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-200 p-4">

            <div className="relative w-full max-w-lg bg-white/70 backdrop-blur-2xl shadow-xl rounded-[2rem] p-8 lg:p-12 border border-white z-10 overflow-hidden">
                {/* Subtle top glare effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

                <div className="flex flex-col items-center mb-6 relative z-10">
                    <img src={eklesiaLogo} alt="Eklesia Logo" className="h-28 w-auto mb-2" />
                    <p className="text-gray-500 mt-1 text-center text-sm">Create a new workspace for your congregation.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="Your Name"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Church Name"
                            type="text"
                            name="churchName"
                            placeholder="Grace Community"
                            value={formData.churchName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Input
                        label="Email address"
                        type="email"
                        name="email"
                        placeholder="admin@church.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button 
                        type="submit" 
                        className="w-full mt-2" 
                        size="lg" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mendaftarkan Gereja...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 relative z-10">
                    Already have an account?{' '}
                    <a href="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                        Sign in
                    </a>
                </p>

            </div>
        </div>
    );
}
