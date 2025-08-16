import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                {/* Tailwind CSS CDN */}
                <script src="https://cdn.tailwindcss.com"></script>

                {/* Optional: You can configure Tailwind here */}
                <script dangerouslySetInnerHTML={{
                    __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'green-600': '#16a34a',
                    'red-600': '#dc2626',
                    'blue-500': '#3b82f6',
                    'blue-700': '#1d4ed8',
                  }
                }
              }
            }
          `
                }} />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;