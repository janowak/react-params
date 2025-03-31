#!/usr/bin/env zx
// @ts-nocheck
$.verbose = true;
$.shell = '/bin/bash';

const basePackages = [
    "core",
    "react-router-dom",
]

process.on('unhandledRejection', (err) => {
    process.exit(1);
});

async function detectPackages(directory, namePattern) {
    try {
        const output = await $`pnpm list --filter "./${directory}/*" --json`;
        const json = JSON.parse(output.stdout);
        return json
            .map(pkg => {
                const match = pkg.name.match(namePattern);
                return match ? match[1] : null;
            })
            .filter(Boolean);
    } catch (error) {
        console.error(`Failed to detect packages in ${directory}`);
        process.exit(1);
    }

}

const packagesToPublish = [
    ...basePackages,
    ...(await detectPackages('packages', /@react-params\/(.+)/) ).filter(pkg => !basePackages.includes(pkg))
]

for (const proj of packagesToPublish) {
    try {
        await $`pnpm --filter @react-params/${proj} exec pnpm version patch`;
        await $`pnpm --filter @react-params/${proj} build`;
        await $`pnpm --filter @react-params/${proj} publish --access public --no-git-checks`;
    } catch (error) {
        process.exit(1);
    }
}

const testPackages = await detectPackages('test', /@react-params\/test-(.+)/);

const dependencies = packagesToPublish.map(pkg => `@react-params/${pkg}@latest`);

for (const proj of testPackages) {
    try {
        await $`pnpm --filter @react-params/test-${proj} update ${dependencies.join(' ')}`;
        await $`find ./test/${proj} -name "node_modules" -type d -prune -exec rm -rf {} +`;
        await $`pnpm --filter @react-params/test-${proj} install`;
    } catch (error) {
        process.exit(1);
    }
}
