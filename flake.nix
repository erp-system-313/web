{
  description = "React Frontend Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            git
          ];

          shellHook = ''
            if ! command -v tsc &> /dev/null; then
              echo "Installing global npm packages..."
              npm install typescript eslint prettier
            fi

            if [ -f package.json ] && [ ! -d node_modules ]; then
              echo "Installing project dependencies..."
              npm install
            fi
          '';
        };
      }
    );
}

