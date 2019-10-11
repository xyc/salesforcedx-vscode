/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { escapeStrForRegex } from 'jest-regex-util';
import * as vscode from 'vscode';
import {
  getLwcTestRunnerExecutable,
  normalizeRunTestsByPath
} from '../testRunner';
import { LwcTestExecutionInfo } from '../types';

export function getDebugConfiguration(
  lwcTestRunnerExecutablePath: string,
  cwd: string,
  testFsPath: string,
  testName: string
): vscode.DebugConfiguration {
  const args = [
    '--debug',
    '--',
    '--runTestsByPath',
    normalizeRunTestsByPath(cwd, testFsPath),
    '--testNamePattern',
    `"${escapeStrForRegex(testName)}"`
  ];
  const debugConfiguration: vscode.DebugConfiguration = {
    type: 'node',
    request: 'launch',
    name: 'Debug LWC test(s)',
    cwd,
    runtimeExecutable: lwcTestRunnerExecutablePath,
    args,
    console: 'integratedTerminal',
    internalConsoleOptions: 'openOnSessionStart',
    port: 9229,
    disableOptimisticBPs: true
  };
  return debugConfiguration;
}

export async function forceLwcTestCaseDebug(data: LwcTestExecutionInfo) {
  const { testUri, testName } = data;
  const { fsPath: testFsPath } = testUri;
  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders[0]
  ) {
    const cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const lwcTestRunnerExecutablePath = getLwcTestRunnerExecutable(cwd);
    if (lwcTestRunnerExecutablePath) {
      const debugConfiguration = getDebugConfiguration(
        lwcTestRunnerExecutablePath,
        cwd,
        testFsPath,
        testName
      );
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(testUri);
      await vscode.debug.startDebugging(workspaceFolder, debugConfiguration);
    }
  }
}
