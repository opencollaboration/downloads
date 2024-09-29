import * as React from 'react';
import { Route, RouteComponentProps, Switch, useLocation } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { NotFound } from '@app/NotFound/NotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import {DownloadComponent, DownloadComponentProps} from "@app/DownloadComponent/DownloadComponent";

let routeFocusTimer: number;
export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params?: DownloadComponentProps | undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    component: Dashboard,
    exact: true,
    label: 'Home',
    path: '/',
    title: 'Downloads | Home',
  },
  {
    label: 'CloudburstMC',
    routes: [
      {
        component: DownloadComponent,
        exact: true,
        label: 'Cloudburst',
        path: '/cloudburst',
        title: 'Downloads | Cloudburst',
        params: {
          projectName: "Cloudburst",
          groupId: "org.cloudburstmc",
          artifactId: "cloudburst-server"
        }
      },
      {
        component: DownloadComponent,
        exact: true,
        label: 'Nukkit',
        path: '/nukkit',
        title: 'Downloads | Nukkit',
        params: {
          projectName: 'Nukkit',
          groupId: 'cn.nukkit',
          artifactId: 'nukkit',
          ignoredVersions: ["2.0.0-SNAPSHOT"]
        }
      }
    ],
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
// may not be necessary if https://github.com/ReactTraining/react-router/issues/5210 is resolved
const useA11yRouteChange = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    routeFocusTimer = window.setTimeout(() => {
      const mainContainer = document.getElementById('primary-app-container');
      if (mainContainer) {
        mainContainer.focus();
      }
    }, 50);
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [pathname]);
};

const RouteWithTitleUpdates = ({ component: Component, title, params, ...rest }: IAppRoute) => {
  useA11yRouteChange();
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    if (params !== undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return <Component {...rest} {...routeProps} projectName={params.projectName} artifactId={params.artifactId} groupId={params.groupId} ignoredVersions={params.ignoredVersions}/>;
    } else {
      return <Component {...rest} {...routeProps}/>;
    }
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Switch>
    {flattenedRoutes.map(({ path, exact, component, title, params }, idx) => (
      <RouteWithTitleUpdates path={path} exact={exact} component={component} key={idx} title={title} params={params} />
    ))}
    <PageNotFound title="404 Page Not Found" />
  </Switch>
);

export { AppRoutes, routes };
