# MorphBox/Lima Troubleshooting Context

## Current Issue
On macOS (Apple Silicon/aarch64), Lima is trying to use QEMU driver instead of native virtualization, causing:
```
time="2025-07-06T22:59:38-07:00" level=fatal msg="failed to find the QEMU binary for the architecture \"aarch64\": exec: \"qemu-system-aarch64\": executable file not found in $PATH"
```

## System Info
- Platform: macOS (Apple Silicon - aarch64)
- User: micah@MBly
- Lima keeps defaulting to QEMU even though vmType is not hardcoded

## What We've Tried
1. ✅ Updated morphbox claude-vm.yaml to remove hardcoded `vmType: "qemu"`
2. ✅ Deleted VM instance with `limactl delete morphbox -f`
3. ✅ Removed ~/.lima/morphbox directory
4. ✅ Reinstalled morphbox completely
5. ✅ Verified ~/.morphbox/claude-vm.yaml has correct config (no vmType specified)
6. ❌ Lima still tries to use QEMU driver on VM creation

## Configuration Files Checked
- `/home/kruger/projects/morphbox/claude-vm.yaml` - Correct (vmType commented out)
- `~/.morphbox/claude-vm.yaml` - Correct (vmType commented out)
- MorphBox script uses: `$MORPHBOX_HOME/claude-vm.yaml` (defaults to ~/.morphbox/)

## Next Steps to Try
1. Check Lima version: `limactl --version`
2. Test if vz driver works: `limactl create --vm-type=vz --name=test template://default`
3. Force vz in config: Add `vmType: "vz"` to ~/.morphbox/claude-vm.yaml
4. Install QEMU as workaround: `brew install qemu`
5. Check if Lima has architecture-specific defaults that override config

## Workaround
Use `--skip-morphbox` flag to bypass VM:
```bash
./bin/morph.js --skip-morphbox "your prompt"
```

## Related Files
- Main script: `/home/kruger/projects/claude-code-morph/bin/morph.js`
- MorphBox script: `/home/kruger/projects/morphbox/morphbox`
- VM config: `/home/kruger/projects/morphbox/claude-vm.yaml`
- Local VM config: `~/.morphbox/claude-vm.yaml`

## Key Findings
- Lima appears to have a default behavior on macOS ARM that's overriding our config
- The vmType auto-selection might not be working as expected
- This could be a Lima bug or version-specific issue

## Questions for Next Session
1. What Lima version is installed?
2. Does Lima support vz on this Mac?
3. Is there a Lima config file that's overriding our settings?
4. Should we file a bug report with Lima project?