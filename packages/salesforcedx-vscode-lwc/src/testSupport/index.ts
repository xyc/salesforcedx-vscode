/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ExtensionContext } from 'vscode';
import { registerLwcTestCodeLensProvider } from './codeLens/lwcTestCodeLensProvider';
import { registerCommands } from './commands';

export function activateLwcTestSupport(context: ExtensionContext) {
  registerCommands(context);
  registerLwcTestCodeLensProvider(context);
}
