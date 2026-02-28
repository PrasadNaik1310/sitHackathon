import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessService } from '../services/business.service';

interface BusinessProfile {
    id: string;
    user_id: string;
    gst_number: string;
    pan_number: string;
    // Note: Backend doesn't store a 'name' yet, so we will generate a mock name based on GST for a premium feel
    business_name: string;
}

interface AppContextType {
    profile: BusinessProfile | null;
    refreshProfile: () => Promise<void>;
    isLoadingProfile: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const refreshProfile = async () => {
        try {
            const data = await BusinessService.getProfile();
            // Attach a mock business name since the backend profile model only has GST & PAN
            data.business_name = "TechCorp Solutions";
            setProfile(data);
        } catch (error) {
            console.error("Failed to fetch global profile context", error);
            setProfile(null);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    return (
        <AppContext.Provider value={{ profile, refreshProfile, isLoadingProfile }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
