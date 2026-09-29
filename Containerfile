###############################################################################
# Build stage
###############################################################################
FROM registry.access.redhat.com/ubi9/nodejs-24 AS builder
WORKDIR /opt/app-root/src
ENV NEXT_TELEMETRY_DISABLED=1 \
    HUSKY=0
COPY --chown=1001:0 package.json package-lock.json ./
RUN npm ci
COPY --chown=1001:0 . .
RUN npm run build

###############################################################################
# Runtime stage
###############################################################################
FROM registry.access.redhat.com/ubi9/nodejs-24-minimal
WORKDIR /opt/app-root/src
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=1001:0 /opt/app-root/src/.next/standalone ./
RUN mkdir -p .next/cache \
    && chgrp -R 0 /opt/app-root/src \
    && chmod -R g=u /opt/app-root/src
USER 1001
EXPOSE 8080
CMD ["node", "server.js"]
