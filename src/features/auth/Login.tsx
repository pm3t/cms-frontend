import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Church, Loader2 } from 'lucide-react';

import { useLogin } from '../../hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await loginMutation.mutateAsync({
                email,
                password,
                tenantId
            });

            // Redirect based on role
            if (result.user.role === 'Super Admin') {
                navigate('/super-admin/tenants');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            alert('Login Gagal: ' + (error.message || 'Kredensial salah'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">

            {/* Decorative blurred background shapes */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="relative w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 z-10">

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary-600 p-3 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                        <Church className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                    <p className="text-gray-500 mt-2 text-center">Sign in to your church dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label="Church ID (Tenant ID)"
                        type="text"
                        placeholder="grace-community"
                        value={tenantId}
                        onChange={(e) => setTenantId(e.target.value)}
                        required
                    />

                    <Input
                        label="Email address"
                        type="email"
                        placeholder="pastor@church.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses Login...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </form>

                {/* Testing Shortcuts */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Testing Shortcuts</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={() => {
                                setTenantId('platform-admin');
                                setEmail('superadmin@technohub.co.id');
                                setPassword('password123');
                            }}
                            className="text-[10px] py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition flex items-center justify-center gap-1"
                        >
                            ⚡ Super Admin
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                setTenantId('gbi-hos');
                                setEmail('benny.gunawan@gmail.com');
                                setPassword('password123');
                            }}
                            className="text-[10px] py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition flex items-center justify-center gap-1"
                        >
                            ⚡ Church Admin
                        </button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                setEmail('bambang.mulyatno@gmail.com');
                                setPassword('password123');
                                setTenantId('gkj-bilur');
                            }}
                        >
                            GKJ Bilur Admin
                        </Button>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <a href="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                        Register your church
                    </a>
                </p>

            </div>
        </div>
    );
}
