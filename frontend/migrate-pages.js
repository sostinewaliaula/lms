// Migration script to convert Next.js pages to Vite + React
// This script helps identify what needs to be changed

const fs = require('fs');
const path = require('path');

const changes = {
  // Remove 'use client' directive
  removeUseClient: /^'use client';\s*\n/gm,
  
  // Replace next/link imports
  nextLinkImport: /import Link from 'next\/link';/g,
  reactRouterLinkImport: "import { Link } from 'react-router-dom';",
  
  // Replace next/navigation imports
  nextRouterImport: /import { useRouter } from 'next\/navigation';/g,
  reactRouterNavigateImport: "import { useNavigate } from 'react-router-dom';",
  
  nextPathnameImport: /import { usePathname } from 'next\/navigation';/g,
  reactRouterLocationImport: "import { useLocation } from 'react-router-dom';",
  
  // Replace router.push() with navigate()
  routerPush: /router\.push\(/g,
  navigatePush: 'navigate(',
  
  // Replace router.replace() with navigate(..., { replace: true })
  routerReplace: /router\.replace\(/g,
  navigateReplace: 'navigate(',
  
  // Replace href with to in Link components
  linkHref: /<Link\s+href=/g,
  linkTo: '<Link to=',
  
  // Replace useRouter() with useNavigate()
  useRouter: /const router = useRouter\(\);?/g,
  useNavigate: 'const navigate = useNavigate();',
  
  // Replace usePathname() with useLocation()
  usePathname: /const pathname = usePathname\(\);?/g,
  useLocation: "const location = useLocation();\n  const pathname = location.pathname;",
};

console.log('Migration patterns identified. Use these to manually update files:');
console.log(JSON.stringify(changes, null, 2));


