import React from 'react';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { isMobile, isTablet } = useIsMobile();

	return (
		<div className="min-h-screen light-app">
			<Header />
			<main
				className={`
					pt-24 relative z-10
					${isMobile ? 'px-3 pb-6' : isTablet ? 'px-4 pb-8' : 'px-6 pb-10'}
					transition-all duration-300 ease-in-out
				`}
			>
				<div
					className={`
						mx-auto
						${isMobile ? 'max-w-full' : isTablet ? 'max-w-4xl' : 'max-w-7xl'}
					`}
				>
					{children}
				</div>
			</main>
		</div>
	);
};

export default Layout; 