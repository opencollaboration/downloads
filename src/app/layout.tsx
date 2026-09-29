import { AppFrame } from '@/components/AppFrame';
import '@patternfly/react-core/dist/styles/base.css';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Open Collaboration Downloads',
    template: 'Downloads | %s',
  },
  description:
    'Download the latest builds of Open Collaboration projects from our Maven repository.',
  applicationName: 'Open Collaboration Downloads',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
