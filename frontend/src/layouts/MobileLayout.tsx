import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, CreditCard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

import styles from './MobileLayout.module.css';

const navItems = [
    { path: '/app/dashboard', label: 'Home', icon: Home },
    { path: '/app/invoices', label: 'Invoices', icon: FileText },
    { path: '/app/loans', label: 'Loans', icon: CreditCard },
    { path: '/app/profile', label: 'Profile', icon: User },
];

export function MobileLayout() {
    const location = useLocation();

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <nav className={styles.bottomNav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path} className={styles.navItem}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        cn(styles.navLink, isActive && styles.active)
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={styles.icon} strokeWidth={isActive ? 3 : 2} />
                                            <span className={styles.label}>{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
