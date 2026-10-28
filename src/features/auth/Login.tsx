import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    Loader2,
    QrCode,
    X,
    CheckCircle2,
    AlertCircle,
    Camera,
    Link as LinkIcon
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import eklesiaLogo from '../../assets/eklesia_logo.png';
import { useLogin } from '../../hooks/useAuth';
import { parseChurchId, getChurchIdFromLocation } from '../../lib/churchId';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const navigate = useNavigate();
    const loginMutation = useLogin();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // 1. On mount: check URL parameters first (?ChurchId=...), then fallback to localStorage
    useEffect(() => {
        const fromUrl = getChurchIdFromLocation();
        if (fromUrl && fromUrl.trim()) {
            const parsed = fromUrl.trim().toLowerCase();
            setTenantId(parsed);
            localStorage.setItem('cms_tenant_id', parsed);
            setStatusMessage({
                text: `Terhubung ke gereja "${parsed}" melalui parameter URL`,
                type: 'success'
            });
            return;
        }

        const saved = localStorage.getItem('cms_tenant_id');
        if (saved && saved.trim()) {
            setTenantId(saved.trim());
        }
    }, []);

    // 2. Lifecycle management for QR Scanner Modal
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (isScanning) {
            const initScanner = () => {
                try {
                    const element = document.getElementById('login-qr-reader');
                    if (!element) {
                        setTimeout(initScanner, 50);
                        return;
                    }

                    scanner = new Html5QrcodeScanner(
                        'login-qr-reader',
                        {
                            fps: 10,
                            qrbox: { width: 220, height: 220 },
                            rememberLastUsedCamera: true,
                            aspectRatio: 1.0
                        },
                        false
                    );

                    scanner.render(
                        (decodedText: string) => {
                            const parsed = parseChurchId(decodedText);
                            if (parsed) {
                                setTenantId(parsed);
                                localStorage.setItem('cms_tenant_id', parsed);
                                setStatusMessage({
                                    text: `Kode gereja "${parsed}" berhasil terhubung!`,
                                    type: 'success'
                                });
                                setIsScanning(false);
                            } else {
                                setStatusMessage({
                                    text: 'QR Code tidak memuat kode gereja yang valid.',
                                    type: 'error'
                                });
                            }
                        },
                        () => {}
                    );
                    scannerRef.current = scanner;
                } catch (err: any) {
                    console.error('Scanner init error:', err);
                    setStatusMessage({
                        text: `Gagal mengakses kamera: ${err.message || err}`,
                        type: 'error'
                    });
                }
            };

            initScanner();
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().then(() => {
                    scannerRef.current = null;
                }).catch(console.error);
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [isScanning]);

    const handleApplyManual = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        const parsed = parseChurchId(manualInput);
        if (parsed) {
            setTenantId(parsed);
            localStorage.setItem('cms_tenant_id', parsed);
            setStatusMessage({
                text: `Kode gereja "${parsed}" berhasil terhubung!`,
                type: 'success'
            });
            setIsScanning(false);
            setManualInput('');
        } else {
            setStatusMessage({
                text: 'URL atau kode gereja tidak valid.',
                type: 'error'
            });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId.trim()) {
            setStatusMessage({ text: 'Kode Gereja (Church ID) wajib diisi.', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const cleanTenantId = tenantId.trim().toLowerCase();
            const result = await loginMutation.mutateAsync({
                email,
                password,
                tenantId: cleanTenantId
            });

            // Save last used church ID
            localStorage.setItem('cms_tenant_id', cleanTenantId);

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

            <div className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8 z-10">
                <div className="flex flex-col items-center mb-6">
                    <img src={eklesiaLogo} alt="Eklesia Logo" className="h-24 w-auto mb-2" />
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Portal Gereja Eklesia</h2>
                    <p className="text-gray-500 text-xs mt-1 text-center">Masuk ke dashboard manajemen gereja Anda</p>
                </div>

                {statusMessage && (
                    <div
                        className={`mb-5 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
                            statusMessage.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        {statusMessage.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span className="flex-1">{statusMessage.text}</span>
                        <button
                            type="button"
                            onClick={() => setStatusMessage(null)}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Church ID with Scan QR button */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Kode Gereja (Church ID) <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusMessage(null);
                                    setIsScanning(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                                <QrCode className="w-3.5 h-3.5 text-primary-600" />
                                <span>Scan QR</span>
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Contoh: gpdi-vmm atau grace-community"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                required
                            />
                            {tenantId && (
                                <button
                                    type="button"
                                    onClick={() => setTenantId('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                                    title="Hapus kode gereja"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                            Scan QR di warta gereja atau masukkan kode ID gereja Anda.
                        </p>
                    </div>

                    <Input
                        label="Email Address"
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

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700">
                                Remember me
                            </label>
                        </div>
                        <div className="text-xs">
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-2 cursor-pointer font-bold shadow-md hover:shadow-lg transition-all"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses Login...
                            </>
                        ) : (
                            'Sign In to Dashboard'
                        )}
                    </Button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-500">
                    Belum mendaftarkan gereja Anda?{' '}
                    <a href="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                        Daftarkan Gereja Baru
                    </a>
                </p>
            </div>

            {/* Modal Scanner QR Gereja */}
            {isScanning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">Scan QR Code Gereja</h3>
                                    <p className="text-xs text-gray-500">Arahkan kamera ke QR Code gereja Anda</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsScanning(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scanner Viewport */}
                        <div className="p-6">
                            <div className="relative bg-black rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center">
                                <div id="login-qr-reader" className="w-full"></div>
                            </div>

                            {/* Manual Input / Paste Section */}
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                    Atau Tempel Link / URL / Kode QR Gereja:
                                </label>
                                <form onSubmit={handleApplyManual} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Contoh: https://app.eklesia.id?ChurchId=gpdi-vmm"
                                            value={manualInput}
                                            onChange={(e) => setManualInput(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="px-4 text-xs font-bold cursor-pointer">
                                        Terapkan
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsScanning(false)}
                                className="cursor-pointer"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
