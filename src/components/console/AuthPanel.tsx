'use client';

import React, { FormEvent } from 'react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { useConsoleStore } from '../../store/consoleStore';
import { authService } from '../../services/auth.service';

export default function AuthPanel() {
    const {
        email, password, otpCode, token,
        setField, setResult, pushLog, setLoading, isLoading,
    } = useConsoleStore();

    const tokenPreview = token
        ? `${token.slice(0, 18)}...${token.slice(-10)}`
        : 'not set';

    const run = async (label: string, fn: () => Promise<unknown>) => {
        try {
            setLoading(true);
            pushLog(`${label} started`);
            const res = await fn();
            const json = (res as { data?: unknown })?.data ?? res;
            setResult(JSON.stringify(json, null, 2));
            pushLog(`${label} success`);
            return json;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setResult(message);
            pushLog(`${label} failed`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        await run('Register', () => authService.register({ email, password }));
    };

    const handleLogin = async () => {
        const json = await run('Login', () => authService.login({ email, password }));
        const accessToken =
            (json as { data?: { accessToken?: string } })?.data?.accessToken ?? '';
        if (accessToken) {
            setField('token', accessToken);
            pushLog('Access token stored');
        }
    };

    const handleStartVerification = () =>
        run('Start verification', () => authService.startVerification(email));

    const handleVerifyEmail = () =>
        run('Verify email', () => authService.verifyEmail({ email, code: otpCode }));

    const handleGetMe = () =>
        run('Get /auth/me', () => authService.getMe());

    return (
        <Card title="Auth (/api/v1/auth)" icon={<KeyRound className="h-4 w-4" />} accentColor="blue">
            <form onSubmit={handleRegister} className="space-y-3">
                <Input
                    label="Email"
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    value={email}
                    onChange={(e) => setField('email', e.target.value)}
                />
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setField('password', e.target.value)}
                />
                <Button type="submit" loading={isLoading}>Register</Button>
            </form>

            <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleStartVerification} loading={isLoading}>
                    Start Verification
                </Button>
                <Button variant="secondary" onClick={handleLogin} loading={isLoading}>
                    Login
                </Button>
                <Button variant="ghost" onClick={handleGetMe} loading={isLoading}>
                    Get /auth/me
                </Button>
            </div>

            <Input
                label="OTP Code"
                icon={<ShieldCheck className="h-4 w-4" />}
                value={otpCode}
                onChange={(e) => setField('otpCode', e.target.value)}
            />
            <Button variant="secondary" onClick={handleVerifyEmail} loading={isLoading}>
                Verify Email
            </Button>

            <Input
                label="Access Token"
                value={token}
                onChange={(e) => setField('token', e.target.value)}
            />
            <p className="text-xs text-gray-600 font-mono">
                Token preview: <span className="text-gray-400">{tokenPreview}</span>
            </p>
        </Card>
    );
}
