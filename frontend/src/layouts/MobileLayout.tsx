import { Outlet, NavLink } from 'react-router-dom';
import { Home, FileText, CreditCard, User } from 'lucide-react';
import { cn } from '../utils';

import styles from './MobileLayout.module.css';

const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/loans', label: 'Loans', icon: CreditCard },
    { path: '/profile', label: 'Profile', icon: User },
];

export function MobileLayout() {
    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    <Outlet />
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
                                    <Icon className={styles.icon} strokeWidth={2.5} />
                                    <span className={styles.label}>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
