{
  description = "React Frontend Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            nodePackages.typescript
            nodePackages.eslint
            nodePackages.prettier
            git
          ];

          shellHook = ''
            if [ -f package.json ] && [ ! -d node_modules ]; then
              echo "Installing npm dependencies..."
              npm install
            fi
          '';
        };
      }
    );
}