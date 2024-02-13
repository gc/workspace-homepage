import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Workspace Homepage is now active!');
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.setAsWorkspaceHomepage', setAsWorkspaceHomepage),
        vscode.workspace.onDidChangeWorkspaceFolders(openAndPinFile)
    );

    openAndPinFile();
}

async function setAsWorkspaceHomepage(uri: vscode.Uri) {
    const message = `Setting workspace homepage to ${uri.fsPath}`;
    vscode.window.showInformationMessage(message);
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const relativePath = vscode.workspace.asRelativePath(uri, true);
    try {
        await vscode.workspace.getConfiguration('workspaceHomepage')
            .update('path', relativePath, vscode.ConfigurationTarget.Workspace)
            .then(() => {
                vscode.window.showInformationMessage(`Workspace homepage set to ${relativePath}`);
            });
    } catch (err) {
        vscode.window.showErrorMessage(`Error: ${(err as Error).message}`);
    }
}

async function openAndPinFile() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const configuration = vscode.workspace.getConfiguration('workspaceHomepage', workspaceFolders[0].uri);
        const homepagePath = configuration.get<string>('path');
        if (homepagePath) {
            const filePath = vscode.Uri.joinPath(workspaceFolders[0].uri, homepagePath);
            try {
                const document = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(document, { preview: false });
            } catch (error) {
                console.error("Could not open workspace homepage file:", error);
            }
        }
    }
}

export function deactivate() {}
