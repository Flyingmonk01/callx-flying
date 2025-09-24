"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCallxModifyMainActivity = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const withCallxModifyMainActivity = (config, options) => {
    if (!options?.package) {
        throw new Error('[callx] Package option is required for modifyMainActivity');
    }
    const { package: packageName } = options;
    return (0, config_plugins_1.withDangerousMod)(config, [
        'android',
        async (configMod) => {
            try {
                const packagePath = packageName.replace(/\./g, '/');
                const possiblePaths = [
                    // Standard paths
                    path.join(configMod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', packagePath, 'MainActivity.kt'),
                    path.join(configMod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'kotlin', packagePath, 'MainActivity.kt'),
                    // Alternative paths (some projects use different structure)
                    path.join(configMod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', packagePath, 'MainActivity.java'),
                    path.join(configMod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'kotlin', packagePath, 'MainActivity.java'),
                    // Root level search
                    path.join(configMod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'MainActivity.kt'),
                    path.join(configMod.modRequest.platformProjectRoot, 'app', 'src', 'main', 'MainActivity.java'),
                ];
                // No verbose logs
                let mainActivityFile = null;
                for (const possiblePath of possiblePaths) {
                    if (fs.existsSync(possiblePath)) {
                        mainActivityFile = possiblePath;
                        // No verbose logs
                        break;
                    }
                }
                if (!mainActivityFile) {
                    // Quietly skip if not found
                    return configMod;
                }
                // Đọc & sửa nội dung
                let content = fs.readFileSync(mainActivityFile, 'utf8');
                let modified = false;
                // Always modify MainActivity to extend CallxReactActivity
                if (!content.includes('import com.callx.CallxReactActivity')) {
                    content = content.replace(/(import com\.facebook\.react\.ReactActivity)/, '$1\nimport com.callx.CallxReactActivity');
                    modified = true;
                }
                // Check if class already extends CallxReactActivity
                if (!content.includes(': CallxReactActivity')) {
                    // Try different patterns for Kotlin class declaration
                    let classModified = false;
                    // Pattern 1: class MainActivity : ReactActivity() {
                    if (content.includes('class MainActivity : ReactActivity()')) {
                        content = content.replace(/class\s+MainActivity\s*:\s*ReactActivity\(\)\s*\{/, 'class MainActivity : CallxReactActivity() {');
                        classModified = true;
                    }
                    // Pattern 2: class MainActivity : ReactActivity {
                    else if (content.includes('class MainActivity : ReactActivity')) {
                        content = content.replace(/class\s+MainActivity\s*:\s*ReactActivity\s*\{/, 'class MainActivity : CallxReactActivity() {');
                        classModified = true;
                    }
                    // Pattern 3: class MainActivity extends ReactActivity {
                    else if (content.includes('class MainActivity extends ReactActivity')) {
                        content = content.replace(/class\s+MainActivity\s+extends\s+ReactActivity\s*\{/, 'class MainActivity : CallxReactActivity() {');
                        classModified = true;
                    }
                    if (classModified) {
                        modified = true;
                    }
                }
                // Add comment if not already present
                const comment = '// Extends CallxReactActivity for automatic lockscreen handling';
                if (!content.includes(comment) &&
                    content.includes(': CallxReactActivity')) {
                    content = content.replace(/(class\s+MainActivity\s*:\s*CallxReactActivity)/, `${comment}\n$1`);
                    modified = true;
                }
                if (modified) {
                    fs.writeFileSync(mainActivityFile, content);
                    console.log(`[callx] ✓ Modified ${path.basename(mainActivityFile)} to extend CallxReactActivity`);
                }
            }
            catch (error) {
                // Silent on failure
            }
            return configMod;
        },
    ]);
};
exports.withCallxModifyMainActivity = withCallxModifyMainActivity;
