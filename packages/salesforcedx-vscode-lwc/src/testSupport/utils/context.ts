/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as vscode from 'vscode';

import { testWatcher } from '../testRunner/testWatcher';
import { SFDX_LWC_JEST_FILE_FOCUSED_CONTEXT } from '../types/constants';
import { isLwcJestTest } from './isLwcJestTest';

function setLwcJestFileFocusedContext(textEditor?: vscode.TextEditor) {
  if (textEditor) {
    vscode.commands.executeCommand(
      'setContext',
      SFDX_LWC_JEST_FILE_FOCUSED_CONTEXT,
      !!isLwcJestTest(textEditor.document)
    );

    testWatcher.setWatchingContext(textEditor.document.uri);
  } else {
    vscode.commands.executeCommand(
      'setContext',
      SFDX_LWC_JEST_FILE_FOCUSED_CONTEXT,
      false
    );
  }
}

export function startWatchingEditorFocusChange(
  context: vscode.ExtensionContext
) {
  setLwcJestFileFocusedContext(vscode.window.activeTextEditor);
  const handleDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    textEditor => {
      setLwcJestFileFocusedContext(textEditor);
    }
  );
  context.subscriptions.push(handleDidChangeActiveTextEditor);
}
