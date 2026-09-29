'use client';

import { HOME_NAV, navGroups } from '@/lib/projects/registry';
import type { MavenProject } from '@/lib/projects/types';
import {
  Masthead,
  MastheadBrand,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  SkipToContent,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const PAGE_ID = 'primary-app-container';

/**
 * Delay before moving focus after a navigation, giving the new page a frame to
 * commit before focus lands in it.
 */
const FOCUS_DELAY_MS = 50;

/** Intrinsic size of the brand image, so the browser can reserve space. */
const LOGO_WIDTH = 135;
const LOGO_HEIGHT = 36;

interface AppFrameProps {
  children: React.ReactNode;
}

/**
 * Sidebar visibility is left to PatternFly. `isManagedSidebar` keeps separate
 * state for mobile and desktop, and its stylesheet already hides the sidebar
 * below the 75rem breakpoint, so the correct layout paints before any
 * JavaScript runs. Deriving it from `window.innerWidth` would be a second,
 * conflicting source of truth that cannot run during server rendering.
 */
export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();

  /**
   * Move focus to the main container after a navigation so screen readers
   * announce the new content and the next Tab press lands inside it.
   *
   * Skipped on first load. Focusing on arrival steals focus from the top of
   * the document and paints a focus ring around the whole main region before
   * the user has interacted with anything.
   */
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(PAGE_ID)?.focus();
    }, FOCUS_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const renderNavItem = (href: string, label: string) => (
    <NavItem key={href} id={href} isActive={pathname === href}>
      <Link href={href}>{label}</Link>
    </NavItem>
  );

  const renderNavGroup = (label: string, groupProjects: MavenProject[]) => (
    <NavExpandable
      key={label}
      id={label}
      title={label}
      isActive={groupProjects.some((project) => pathname === `/${project.slug}`)}
      isExpanded={groupProjects.some((project) => pathname === `/${project.slug}`)}
    >
      {groupProjects.map((project) => renderNavItem(`/${project.slug}`, project.label))}
    </NavExpandable>
  );

  // PatternFly's masthead defaults to a stacked layout, which puts the logo on
  // its own row above the toggle. `inline` keeps them on one row.
  const masthead = (
    <Masthead display={{ default: 'inline' }}>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton variant="plain" aria-label="Global navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand>
          <MastheadLogo>
            {/*
              Plain <img>: the logo is a fixed-size brand asset served straight
              from `public/`, so `next/image` optimisation adds no value here.
              The dimensions let the browser reserve space. Actual size comes
              from CSS, because PatternFly's base reset overrides the attribute.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Open Collaboration"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
            />
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Nav id="nav-primary-simple">
          <NavList id="nav-list-simple">
            {renderNavItem(HOME_NAV.href, HOME_NAV.label)}
            {navGroups.map((group) => renderNavGroup(group.label, group.projects))}
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  const skipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        document.getElementById(PAGE_ID)?.focus();
      }}
      href={`#${PAGE_ID}`}
    >
      Skip to Content
    </SkipToContent>
  );

  return (
    <Page
      isManagedSidebar
      // PatternFly leaves this undefined, which starts the desktop sidebar
      // closed. Mobile is hardcoded closed regardless.
      defaultManagedSidebarIsOpen
      mainContainerId={PAGE_ID}
      masthead={masthead}
      sidebar={sidebar}
      skipToContent={skipToContent}
    >
      {children}
    </Page>
  );
}
